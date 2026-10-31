import 'dotenv/config';
import { Worker } from 'bullmq';
import prisma from './db/prisma';
import { redisConn } from './config/redis';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// send an event to the browser through Redis
const publish = async (taskId: string, data: object) => {
    await redisConn.publish(`task:${taskId}`, JSON.stringify(data));
};

// FAKE agent steps. Later we replace this with the real Claude agent.
const fakeSteps = [
    { type: 'THOUGHT', content: 'I will read the task and make a plan' },
    { type: 'COMMAND', content: 'npm create vite@latest my-app' },
    { type: 'FILE_EDIT', content: 'Created src/Login.jsx' },
    { type: 'COMMAND', content: 'npm run build' },
    { type: 'MESSAGE', content: 'Task finished successfully' },
] as const;

const worker = new Worker(
    'tasks',
    async (job) => {
        const { taskId } = job.data;
        console.log('Got job for task:', taskId);

        const task = await prisma.task.findUnique({ where: { id: taskId } });

        if (!task) {
            console.log('Task not found in database');
            return;
        }

        if (task.status !== 'QUEUED') {
            console.log('Skipping, task status is', task.status);
            return;
        }

        console.log('Running task...');

        // 1. mark as running
        await prisma.task.update({
            where: { id: taskId },
            data: { status: 'RUNNING', startedAt: new Date() },
        });
        await publish(taskId, { event: 'status', status: 'RUNNING' });

        try {
            let index = 0;

            for (const step of fakeSteps) {
                // stop if the user pressed Stop
                const current = await prisma.task.findUnique({ where: { id: taskId } });

                if (current?.status === 'CANCELLED') {
                    console.log('Task cancelled:', taskId);
                    return;
                }

                // 2. save the step, then send it to the browser
                const savedStep = await prisma.taskStep.create({
                    data: { taskId, index, type: step.type, content: step.content },
                });
                await publish(taskId, { event: 'step', step: savedStep });

                index++;
                await sleep(2000); // pretend the agent is working
            }

            // 3. mark as completed
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'COMPLETED',
                    result: 'Fake agent finished the task',
                    finishedAt: new Date(),
                },
            });
            await publish(taskId, { event: 'status', status: 'COMPLETED' });
        } catch (error: any) {
            console.error('worker error:', error);

            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'FAILED',
                    error: error.message || 'Unknown error',
                    finishedAt: new Date(),
                },
            });
            await publish(taskId, { event: 'status', status: 'FAILED' });
        }
    },
    { connection: redisConn, concurrency: 2 }
);

worker.on('completed', (job) => console.log('Job done:', job.id));
worker.on('failed', (job, err) => console.log('Job failed:', job?.id, err.message));

console.log('Worker started, waiting for tasks...');