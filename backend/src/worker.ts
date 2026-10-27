import prisma from "../src/db/prisma";
import Worker from "bullmq";

import { StepType } from "./generated/prisma/browser";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fakeSteps: { type: StepType; content: string }[] = [
  { type: "THOUGHT", content: "I will read the task and make a plan" },
  { type: "COMMAND", content: "npm create vite@latest my-app" },
  { type: "FILE_EDIT", content: "Created src/Login.jsx" },
  { type: "COMMAND", content: "npm run build" },
  { type: "MESSAGE", content: "Task finished successfully" },
];

const worker = new Worker.Worker("tasks", async (job) => {
  const { taskId } = job.data;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.status !== "QUEUED") {
    throw new Error(`Task with ID ${taskId} not found or not in QUEUED status`);
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "RUNNING", startedAt: new Date() },
  });
  let index = 0;

  for (const step of fakeSteps) {
    const current = await prisma.task.findUnique({ where: { id: taskId } });
    if (current?.status === "CANCELLED") {
      console.log("Task cancelled:", taskId);
      return;
    }

    await prisma.taskStep.create({
      data: {
        taskId,
        index,
        type: step.type,
        content: step.content,
      },
    });
    index++;

    await sleep(2000);
  }
});
