'use client';

import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { TaskStep } from '@/types';

interface EditorPanelProps {
    steps: TaskStep[];
}


const getLanguage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();

    if (ext === 'ts' || ext === 'tsx') return 'typescript';
    if (ext === 'js' || ext === 'jsx') return 'javascript';
    if (ext === 'json') return 'json';
    if (ext === 'css') return 'css';
    if (ext === 'html') return 'html';
    if (ext === 'md') return 'markdown';

    return 'plaintext';
};

export default function EditorPanel({ steps }: EditorPanelProps) {
    const [selectedPath, setSelectedPath] = useState('');

    // build the files from FILE_EDIT steps: path -> latest content
    const files = useMemo(() => {
        const map = new Map<string, string>();

        steps.forEach((step) => {
            if (step.type === 'FILE_EDIT' && step.metadata?.path) {
                map.set(step.metadata.path, step.metadata.content);
            }
        });

        return map;
    }, [steps]);

    // the file edited last
    const lastPath = useMemo(() => {
        const edits = steps.filter((s) => s.type === 'FILE_EDIT' && s.metadata?.path);

        return edits.length > 0 ? edits[edits.length - 1].metadata!.path : '';
    }, [steps]);

  
    useEffect(() => {
        if (lastPath) {
            setSelectedPath(lastPath);
        }
    }, [lastPath]);

    const paths = Array.from(files.keys()).sort();

    if (paths.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-sm text-zinc-600">
                No files yet. Files created by the agent will show here.
            </div>
        );
    }

    return (
        <div className="h-full flex">
            {/* file list */}
            <div className="w-56 shrink-0 border-r border-zinc-800 overflow-y-auto py-2">
                <p className="text-xs uppercase text-zinc-500 px-3 mb-2">Files</p>

                {paths.map((path) => (
                    <button
                        key={path}
                        onClick={() => setSelectedPath(path)}
                        className={`block w-full text-left px-3 py-1.5 text-sm truncate ${
                            path === selectedPath
                                ? 'bg-zinc-800 text-white'
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                    >
                        {path}
                    </button>
                ))}
            </div>

            {/* editor */}
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-800">
                    {selectedPath}
                </div>

                <div className="flex-1">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        path={selectedPath}
                        language={getLanguage(selectedPath)}
                        value={files.get(selectedPath) ?? ''}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>
            </div>
        </div>
    );
}