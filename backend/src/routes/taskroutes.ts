import Router from "express";
import { cancelTask, createTask, deleteTask, getAllTasks, getTaskById, UpdateTask } from "../controller/taskcontroller";
import { authMiddleware } from "../middleware/authmiddleware";

const taskRouter = Router();    

taskRouter.post("/create", authMiddleware , createTask);
taskRouter.get("/all",authMiddleware, getAllTasks);   
taskRouter.get("/:taskId",authMiddleware, getTaskById); 
taskRouter.put("/:taskId",authMiddleware, UpdateTask);
taskRouter.delete("/:taskId",authMiddleware, deleteTask);
taskRouter.post("/:taskId/cancel",authMiddleware, cancelTask);


export default taskRouter;