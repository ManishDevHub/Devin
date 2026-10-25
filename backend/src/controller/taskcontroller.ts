

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

export const getAllTasks = async ( req:AuthRequest , res: Response) => {

    try{

        const task = await prisma.task.findMany({
            where:{
                userId: req.user?.id as string
            },
        })
        if(!task) {
            return res.status(404).json({ message: "No tasks found"})
        }

        return res.status(200).json({
            message: " Tasks fetched successfully",
            task
        })



    } catch(error) {
        console.error("getAllTasks error: " , error);
        return res.status(500).json({ message: "Internal server error"});
    }
}


export const getTaskById  = async ( req: AuthRequest , res: Response ) => {

    try{

        const { id } = req.params as { id: string };
        const userId = req.user?.id as string;
        const task = await prisma.task.findUnique({
            where:{
                id: id,
                userId: userId
            }
        })

        if(!task) {
            return res.status(404).json({ message: "Task not found" })
        }

        return res.status(200).json({
            message: "Task fetched successfully",
            task
        })

    }catch(error) {

        console.error("getTaskById error" , error);
        return res.status(500).json({ message: "Internal server error"})

    }
}

const UpdateTask = async (req:AuthRequest , res: Response) => {

    try{ 

        const { id } = req.params as { id: string };
        const { prompt } = req.body;
        const userId = req.user?.id as string;

        const task = await prisma.task.update({
            where:{
                id: id,     
            userId: userId
            },
            data:{
                prompt
            }
        })  
    if(!task) { 
        return res.status(404).json({ message: "Task not found" })
    }
    return res.status(200).json({
        message: "Task updated successfully",
        task
    })

    } catch(error) {
        console.error("UpdateTask error" , error);
        return res.status(500).json({ message: "Internal server error"})
    }
}

export const deleteTask = async ( req: AuthRequest , res: Response ) => {

    try{  

        const { id } = req.params as { id: string };
        const userId = req.user?.id as string;  

        const task = await prisma.task.delete({
            where:{
                id: id,
                userId: userId
            }
        })  

        return res.status(200).json({ 
            message: "Task deleted successfully"
        })

      } catch(error) {
        console.error("deleteTask error" , error);
        return res.status(500).json({ message: "Internal server error"})
    } 
}  
