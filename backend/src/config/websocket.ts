import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import IORedis from 'ioredis';
import prisma from '../db/prisma';

const clients = new Map<string, Set<WebSocket>>();

export const setupWebSocket = (server: Server) => {
    const wss = new WebSocketServer({ server, path: '/ws' });


    const subscriber = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
    subscriber.psubscribe('task:*');

   
    subscriber.on('pmessage', (_pattern, channel, message) => {
        const taskId = channel.split(':')[1];
        const sockets = clients.get(taskId);

        if (!sockets) return;

        sockets.forEach((socket) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
            }
        });
    });

    wss.on('connection', async (socket, req) => {
        try {
            const url = new URL(req.url || '', 'http://localhost');
            const token = url.searchParams.get('token');
            const taskId = url.searchParams.get('taskId');

            if (!token || !taskId) {
                socket.close(1008, 'token and taskId are required');
                return;
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'supersecret_careerhub_jwt_key_2026'
            ) as { userId: string };

       
            const task = await prisma.task.findFirst({
                where: { id: taskId, userId: decoded.userId },
            });

            if (!task) {
                socket.close(1008, 'Task not found');
                return;
            }

            if (!clients.has(taskId)) {
                clients.set(taskId, new Set());
            }
            clients.get(taskId)!.add(socket);

            socket.send(JSON.stringify({ event: 'connected', taskId }));

            socket.on('close', () => {
                clients.get(taskId)?.delete(socket);
                if (clients.get(taskId)?.size === 0) {
                    clients.delete(taskId);
                }
            });
        } catch (error) {
            socket.close(1008, 'Invalid token');
        }
    });
};