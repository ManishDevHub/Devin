import Docker from 'dockerode';
import { PassThrough } from 'stream';

const docker = new Docker();
const IMAGE = 'node:20-slim';

export const createSandbox = async (taskId: string) => {

const name = `sandbox-${taskId}`;
    try{
        await docker.getContainer(name).remove({ force: true });


    } catch(error){
        console.error('Error creating sandbox:', error);
        throw error;
    }

    const container = await docker.createContainer({

        Image: IMAGE,
        name,
        Cmd:['sleep', 'infinity'],
        WorkingDir: '/workspace',
        HostConfig:{
            Memory:1024 * 1024 * 1024, // 1GB
            NanoCpus:1_000_000_000, // 1 CPU
        },
    })

    await container.start();
    return container;
}