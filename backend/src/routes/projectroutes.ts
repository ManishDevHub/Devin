
import { Router } from "express";
import { createProject, deleteProject, getAllProjects, UpdateProject } from "../controller/projectcontroller";

const projectRouter = Router();

projectRouter.post("/create", createProject);
projectRouter.get("/all", getAllProjects);
projectRouter.put("/all/:userId", UpdateProject);
projectRouter.delete("/all/:userId", deleteProject);

export default projectRouter;

