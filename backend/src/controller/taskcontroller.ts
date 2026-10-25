

import { Response} from "express";
import AuthRequest from "../middleware/authmiddleware";
import prisma from "../db/prisma";


export const createTask =  async( req: AuthRequest , res:Response) => {
    
    try{

        const { projectId , prompt } = req.body;

        const newTask = await prisma.task.create({
            data:{
                projectId,
                prompt,
                userId: req.user?.id as string
            }
            
        })

        return res.status(201).json({
            message: "Task created successfully",
            task: newTask
        })


    } catch( error) {
        console.error("createTask error:" , error);
        return res.status(500).json({ message: "Internal server error"});
    }
}