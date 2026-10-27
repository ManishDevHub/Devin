
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
 export const redisConn = new IORedis(process.env.REDIS_URL || REDIS_URL,
    { maxRetriesPerRequest: null }
);


