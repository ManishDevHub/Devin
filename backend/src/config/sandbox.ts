import Docker from 'dockerode';
import { exitCode } from 'process';
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

    let timer: NodeJS.Timeout | null = null;
    const timeout = new Promise<string>((resolve) => {
        timer = setTimeout(() => resolve('timeout'), timeoutMs);
    })
    const result = await Promise.race([finished, timeout]);

    clearTimeout(timer!);
    if(result === 'timeout'){
        stream.destroy();
        return { output:output + '\n[command timed out]', exitCode:124};
    }

    const info = await exec.inspect();
    return {

        output:output.slice(-20000),
        exitCode:info.ExitCode ?? 0,
    };

};

export const writeFile = async ( container: Docker.Container,path:string, content:string) => {

    if(path.includes('..') || path.includes("'") || path.startsWith('/')){
        throw new Error(`Invalid file path: ${path}`);
    }
}