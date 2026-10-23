import {Request , Response}from "express";
import prisma from "../db/prisma";
import AuthRequest from "../middleware/authmiddleware"



export const createProject = async (req: AuthRequest, res: Response) => {
    try{
        const { name , description , repoUrl } = req.body

        if(!name){
            return res.status(400).json({ message: "Project name is required" });
        }

        const newProject = await prisma.project.create({
            data:{
                name,
                description,
                repoUrl,
                userId: req.user?.id as string
            }
        })

        return res.status(201).json({
            message:" Project created successfully",
            project: newProject
        })

    } catch (error) {
        console.error("createProject error; ", error);
        return res.status(500).json({  message: 'Internal server error' });
    }
}