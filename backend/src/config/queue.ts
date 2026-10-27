import { Queue } from "bullmq";
import { redisConn } from "./redis";

export const taskQueue = new Queue('tasks', { connection: redisConn });