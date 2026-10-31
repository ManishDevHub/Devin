
import { Router } from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, UpdateProject } from "../controller/projectcontroller";
import { authMiddleware } from "../middleware/authmiddleware";

const projectRouter = Router();

projectRouter.post("/create", authMiddleware, createProject);
projectRouter.get("/all",authMiddleware, getAllProjects);
projectRouter.get("/:userId",authMiddleware, getProjectById);
projectRouter.put("/:userId",authMiddleware, UpdateProject);
projectRouter.delete("/:userId",authMiddleware, deleteProject);

export default projectRouter;

