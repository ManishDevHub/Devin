'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { Project } from '@/types';

export default function DashboardPage() {
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProjects = async () => {
            const token = localStorage.getItem('token');

            // not logged in, go to login page
            if (!token) {
                router.push('/login');
                return;
            }

            const user = localStorage.getItem('user');
            if (user) {
                setUsername(JSON.parse(user).username);
            }

            try {
                const { ok, status, data } = await apiFetch('/api/projects');

                if (status === 401) {
                    localStorage.clear();
                    router.push('/login');
                    return;
                }

                if (ok) {
                    setProjects(data.projects);
                }
            } catch (err) {
                setError('Cannot connect to server');
            }
        };

        loadProjects();
    }, [router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            const { ok, data } = await apiFetch('/api/projects', 'POST', { name });

            if (!ok) {
                setError(data.message || 'Could not create project');
                return;
            }

            // add the new project on top of the list
            setProjects([data.project, ...projects]);
            setName('');
        } catch (err) {
            setError('Cannot connect to server');
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold">Hi, {username}</h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-zinc-400 hover:text-white"
                >
                    Logout
                </button>
            </div>

            <form onSubmit={handleCreate} className="flex gap-2 mb-2">
                <input
                    type="text"
                    placeholder="New project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 outline-none focus:border-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 rounded px-4 font-medium"
                >
                    Create
                </button>
            </form>

            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

            <div className="space-y-3 mt-6">
                {projects.length === 0 && (
                    <p className="text-zinc-500">No projects yet. Create your first one above.</p>
                )}

                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/project/${project.id}`}
                        className="block bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg p-4"
                    >
                        <h2 className="font-medium">{project.name}</h2>
                        {project.description && (
                            <p className="text-sm text-zinc-400 mt-1">{project.description}</p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}