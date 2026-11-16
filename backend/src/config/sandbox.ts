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


export const runCommand = async ( container: Docker.Container, command:string, timeoutMs: number = 120000) => {

    const exec = await container .exec({
        Cmd: ['bash', '-c', command],
        AttachStdout: true,
        AttachStderr: true, 
        WorkingDir: '/workspace',
    })

    const stream = await exec.start({ hijack:true, stdin:false });

    const stdout = new PassThrough();
    const stderr = new PassThrough();
    container.modem.demuxStream(stream, stdout, stderr);
    let output = '';
    stdout.on('data', (chunk) => (output += chunk.toString()));
    stderr.on('data', (chunk) => (output += chunk.toString()));

    const finished = new Promise<string>((resolve ) => {
        stream.on('end',() => resolve('done'))
    });
    

}