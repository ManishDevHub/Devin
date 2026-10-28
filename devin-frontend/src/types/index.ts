export interface User {
    id: string;
    username: string;
    email: string;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    repoUrl: string | null;
    createdAt: string;
}

export interface Task {
    id: string;
    prompt: string;
    status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    result: string | null;
    error: string | null;
    projectId: string;
    createdAt: string;
}

export interface TaskStep {
    id: string;
    taskId: string;
    index: number;
    type: 'THOUGHT' | 'COMMAND' | 'FILE_EDIT' | 'BROWSER' | 'MESSAGE' | 'ERROR';
    content: string;
    createdAt: string;
}