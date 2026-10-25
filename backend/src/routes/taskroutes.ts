import Router from "express";
import { cancelTask, createTask, deleteTask, getAllTasks, getTaskById, UpdateTask } from "../controller/taskcontroller";

const taskRouter = Router();    

taskRouter.post("/create", createTask);
taskRouter.get("/all", getAllTasks);   
taskRouter.get("/:taskId", getTaskById); 
taskRouter.put("/:taskId", UpdateTask);
taskRouter.delete("/:taskId", deleteTask);
taskRouter.post("/:taskId/cancel", cancelTask);


export default taskRouter;