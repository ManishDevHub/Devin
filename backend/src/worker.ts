
import prisma from "../src/db/prisma";
import Worker from "bullmq";
import redisConn from "../src/config/redis";
import { StepType } from "./generated/prisma/browser";


const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fakeSteps: { type: StepType; content: string }[] = [
    { type: 'THOUGHT', content: 'I will read the task and make a plan' },
    { type: 'COMMAND', content: 'npm create vite@latest my-app' },
    { type: 'FILE_EDIT', content: 'Created src/Login.jsx' },
    { type: 'COMMAND', content: 'npm run build' },
    { type: 'MESSAGE', content: 'Task finished successfully' },
];

const worker = new Worker.Worker(
    'tasks',
    async (job) => {

        const { taskId } = job.data;

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.status !== 'QUEUED') {
            throw new Error(`Task with ID ${taskId} not found or not in QUEUED status`);
        }
    }
)