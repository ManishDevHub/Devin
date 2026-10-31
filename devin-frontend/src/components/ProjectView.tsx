'use client';

import { useEffect, useRef, useState } from 'react';


import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Task, TaskStep } from '@/types';
import { useRouter } from 'next/navigation';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

// color for each step type
const stepColors: Record<string, string> = {
    THOUGHT: 'text-purple-400',
    COMMAND: 'text-green-400',
    FILE_EDIT: 'text-blue-400',
    BROWSER: 'text-yellow-400',
    MESSAGE: 'text-zinc-200',
    ERROR: 'text-red-400',
};

// join two lists of steps, no duplicates, sorted by index
const mergeSteps = (oldSteps: TaskStep[] = [], newSteps: TaskStep[] = []) => {
    const map = new Map<number, TaskStep>();

    oldSteps.forEach((s) => map.set(s.index, s));
    newSteps.forEach((s) => map.set(s.index, s));

    return Array.from(map.values()).sort((a, b) => a.index - b.index);
};

export default function ProjectView({ projectId }: { projectId: string }) {
     const router = useRouter();
    
   

    const [projectName, setProjectName] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTaskId, setActiveTaskId] = useState('');
    const [steps, setSteps] = useState<TaskStep[]>([]);
    const [status, setStatus] = useState('');
    const [prompt, setPrompt] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    const activeTask = tasks.find((t) => t.id === activeTaskId);

   useEffect(() => {
    const loadPage = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const projectRes = await apiFetch(`/api/projects/${projectId}`);

            if (projectRes.status === 401) {
                localStorage.clear();
                router.push('/login');
                return;
            }

            if (!projectRes.ok) {
                setError(projectRes.data.message || 'Project not found');
                return;
            }

            setProjectName(projectRes.data.project.name);

            const tasksRes = await apiFetch(`/api/tasks/all?projectId=${projectId}`);

         if (tasksRes.ok) {
    const taskList: Task[] = tasksRes.data.tasks || [];

    setTasks(taskList);

    if (taskList.length > 0) {
        setActiveTaskId(taskList[0].id);
    }
}
        } catch (err) {
            setError('Cannot connect to server');
        }
    };

    loadPage();
}, [projectId, router]);


    useEffect(() => {
        if (!activeTaskId) return;

        let cancelled = false;
        let socket: WebSocket | null = null;

        setSteps([]);
        setStatus('');

        const loadTask = async () => {
            const { ok, data } = await apiFetch(`/api/tasks/${activeTaskId}`);

            if (!ok || cancelled) return null;

     setSteps((prev) => mergeSteps(prev, data.task.steps || []));
            setStatus(data.task.status);

            return data.task as Task;
        };

        const start = async () => {
            const task = await loadTask();

            if (!task || cancelled) return;

       
            if (task.status !== 'QUEUED' && task.status !== 'RUNNING') return;

            const token = localStorage.getItem('token') || '';

            socket = new WebSocket(
                `${WS_URL}/ws?token=${encodeURIComponent(token)}&taskId=${activeTaskId}`
            );

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.event === 'connected') {
             
                    loadTask();
                }

                if (message.event === 'step') {
                    setSteps((prev) => mergeSteps(prev, [message.step]));
                }

                if (message.event === 'status') {
                    setStatus(message.status);
                }
            };
        };

        start();

     
        return () => {
            cancelled = true;
            socket?.close();
        };
    }, [activeTaskId]);

    // reload the task every 2 seconds while it is queued or running
useEffect(() => {
    if (!activeTaskId) return;
    if (status !== 'QUEUED' && status !== 'RUNNING') return;

    const timer = setInterval(async () => {
        const { ok, data } = await apiFetch(`/api/tasks/${activeTaskId}`);

        if (ok && data.task) {
            setSteps((prev) => mergeSteps(prev, data.task.steps || []));
            setStatus(data.task.status);
        }
    }, 2000);

    return () => clearInterval(timer);
}, [activeTaskId, status]);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [steps]);

    const handleSend = async () => {
        setError('');

        if (prompt.trim().length < 5) {
            setError('Write at least 5 characters');
            return;
        }

        setSending(true);

        try {
            const { ok, data } = await apiFetch('/api/tasks/create', 'POST', {
                projectId,
                prompt: prompt.trim(),
            });

           if (!ok || !data.task) {
    setError(data.message || 'Could not start task');
    return;
}

setTasks([data.task, ...tasks]);
setActiveTaskId(data.task.id);
            setPrompt('');
        } catch (err) {
            setError('Cannot connect to server');
        } finally {
            setSending(false);
        }
    };

    const handleStop = async () => {
        try {
            const { ok, data } = await apiFetch(`/api/tasks/${activeTaskId}/cancel`, 'POST');

            if (ok) {
                setStatus('CANCELLED');
            } else {
                setError(data.message || 'Could not stop task');
            }
        } catch (err) {
            setError('Cannot connect to server');
        }
    };

    const isRunning = status === 'QUEUED' || status === 'RUNNING';

    return (
        <div className="flex h-screen">
            {/* LEFT: chat panel */}
            <section className="w-105 shrink-0 border-r border-zinc-800 flex flex-col">
                {/* header */}
                <div className="px-4 py-3 border-b border-zinc-800">
                    <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-white">
                        ← Back to dashboard
                    </Link>
                    <h1 className="font-semibold truncate">{projectName || 'Project'}</h1>

                    {tasks.length > 1 && (
                        <select
                            value={activeTaskId}
                            onChange={(e) => setActiveTaskId(e.target.value)}
                            className="mt-2 w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm outline-none"
                        >
                            {tasks.map((task) => (
                                <option key={task.id} value={task.id}>
                                    {task.prompt.slice(0, 40)}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {!activeTask && (
                        <p className="text-sm text-zinc-500">
                            No tasks yet. Write what you want to build below.
                        </p>
                    )}

                    {activeTask && (
                        <div className="bg-zinc-800 rounded-lg px-3 py-2 text-sm">
                            {activeTask.prompt}
                        </div>
                    )}

                    {steps.map((step) => (
                        <div key={step.id} className="text-sm">
                            <span className={`text-xs font-mono ${stepColors[step.type]}`}>
                                {step.type}
                            </span>
                            <p className="text-zinc-300 mt-0.5 whitespace-pre-wrap">
                                {step.content}
                            </p>
                        </div>
                    ))}

                    {status && (
                        <div className="flex items-center gap-3 pt-2">
                            <span className="text-xs bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1">
                                {status}
                            </span>

                            {isRunning && (
                                <button
                                    onClick={handleStop}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Stop
                                </button>
                            )}
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* input */}
                <div className="border-t border-zinc-800 p-3">
                    {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

                    <textarea
                        rows={3}
                        placeholder="Tell the engineer what to do next..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                handleSend();
                            }
                        }}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm resize-none outline-none focus:border-purple-500"
                    />

                    <button
                        onClick={handleSend}
                        disabled={sending || isRunning}
                        className="mt-2 w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-lg py-2 text-sm font-medium"
                    >
                        {sending ? 'Sending...' : isRunning ? 'Agent is working...' : 'Send'}
                    </button>
                </div>
            </section>

            {/* RIGHT: workspace (terminal and editor come next) */}
            <section className="flex-1 flex flex-col">
                <div className="flex-1 border-b border-zinc-800 flex items-center justify-center text-zinc-600 text-sm">
                    Editor goes here (Part 4)
                </div>
                <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
                    Terminal goes here (Part 3)
                </div>
            </section>
        </div>
    );
}