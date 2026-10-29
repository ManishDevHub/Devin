
import { Router } from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, UpdateProject } from "../controller/projectcontroller";
import { authMiddleware } from "../middleware/authmiddleware";

const projectRouter = Router();

projectRouter.post("/create", authMiddleware, createProject);
projectRouter.get("/all",authMiddleware, getAllProjects);
projectRouter.get("/:userId", getProjectById);
projectRouter.put("/:userId", UpdateProject);
projectRouter.delete("/:userId", deleteProject);

export default projectRouter;

