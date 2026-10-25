
import { Router } from "express";
import { createProject, deleteProject, getAllProjects, getProjectById, UpdateProject } from "../controller/projectcontroller";

const projectRouter = Router();

projectRouter.post("/create", createProject);
projectRouter.get("/all", getAllProjects);
projectRouter.get("/:userId", getProjectById);
projectRouter.put("/:userId", UpdateProject);
projectRouter.delete("/:userId", deleteProject);

export default projectRouter;

