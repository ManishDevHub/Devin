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

export const getAllProjects = async ( req: AuthRequest , res: Response) => {
    try{

        const projects = await prisma.project.findMany({
            where:{
                
                userId: req.user?.id as string

            },
            orderBy:{
                createdAt: "desc"
            }
        })
        return res.status(200).json({
            message: "Projects fetched successfully",
            projects
        })


    }catch(error){

        console.error("getAllProjects error: " , error)
        return res.status(500).json({ message: "Internal server error"})
    }
}


export const getProjectById = async ( req:AuthRequest , res: Response) =>{

    try{

        const { id } = req.params as { id: string };
        const userId = req.user?.id as string;
        const project = await prisma.project.findUnique({
            where:{
                id: id,
                userId: userId
            }
        })

        if(!project){
            return res.status(404).json({ message: "Project not found"})
        }

        return res.status(200).json({
            message: "Project fetched successfully",
            project
        })

    } catch(error){

        console.error("getProjectById error:" , error);
        return res.status(500).json({ message: "Internal server error"})
    }
}