
import { Router } from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, UpdateProject } from "../controller/projectcontroller";
import { authMiddleware } from "../middleware/authmiddleware";

const projectRouter = Router();

projectRouter.post("/create", authMiddleware, createProject);
projectRouter.get("/all",authMiddleware, getAllProjects);
projectRouter.get("/:id",authMiddleware, getProjectById);
projectRouter.put("/:id",authMiddleware, UpdateProject);
projectRouter.delete("/:id",authMiddleware, deleteProject);

export default projectRouter;

