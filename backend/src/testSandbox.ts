import { createSandbox, runCommand, writeFile, readFile, destroySandbox } from './config/sandbox';

const test = async () => {
    console.log('Creating sandbox...');
    const sandbox = await createSandbox('test1');

    try {
        console.log('1. versions:', await runCommand(sandbox, 'node -v && npm -v'));

        await writeFile(sandbox, 'src/hello.js', "console.log('Hello from the sandbox');");

        console.log('2. run file:', await runCommand(sandbox, 'node src/hello.js'));
        console.log('3. list files:', await runCommand(sandbox, 'ls -R'));
        console.log('4. read file:', await readFile(sandbox, 'src/hello.js'));
        console.log('5. failing command:', await runCommand(sandbox, 'exit 3'));
       

    } finally {
        await destroySandbox(sandbox);
        console.log('Sandbox removed');
    }
};

test().catch(console.error);