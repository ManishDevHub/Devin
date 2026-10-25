import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authrouter';
import prisma from './db/prisma';
import projectRouter from './routes/projectroutes';
import taskRouter from './routes/taskroutes';
const PORT = process.env.PORT || 5000;

dotenv.config();
const app = express();
app.use(express.json());


app.use('/api/auth',  authRouter);
app.use('/api/projects', projectRouter);
app.use("/api/tasks" ,  taskRouter)


async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully via Prisma!');
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Database connection failed!');
    console.error(error);
    process.exit(1);
  }
}

startServer();
