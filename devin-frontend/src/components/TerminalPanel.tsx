'use client';

import { useEffect, useRef, useState } from 'react';
import '@xterm/xterm/css/xterm.css';
import { TaskStep } from '@/types';

interface TerminalPanelProps {
    taskId: string;
    steps: TaskStep[];
}

// how each step looks in the terminal (colors are ANSI codes)
const formatStep = (step: TaskStep): string | null => {
    if (step.type === 'COMMAND') return `\x1b[32m$ ${step.content}\x1b[0m`;
    if (step.type === 'FILE_EDIT') return `\x1b[34m[file] ${step.content}\x1b[0m`;
    if (step.type === 'ERROR') return `\x1b[31m[error] ${step.content}\x1b[0m`;

    // thoughts and messages stay in the chat panel
    return null;
};

export default function TerminalPanel({ taskId, steps }: TerminalPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<any>(null);
    const writtenRef = useRef<Set<string>>(new Set());
    const [ready, setReady] = useState(false);

    // 1. create the terminal once, in the browser
    useEffect(() => {
        let term: any = null;
        let observer: ResizeObserver | null = null;
        let disposed = false;

        const setup = async () => {
            // xterm needs the browser, so we load it here and not at the top
            const { Terminal } = await import('@xterm/xterm');
            const { FitAddon } = await import('@xterm/addon-fit');

            if (disposed || !containerRef.current) return;

            term = new Terminal({
                fontSize: 13,
                convertEol: true,
                theme: { background: '#0a0a0a' },
            });

            const fit = new FitAddon();
            term.loadAddon(fit);
            term.open(containerRef.current);
            fit.fit();

            term.writeln('\x1b[90mTerminal ready\x1b[0m');

            // resize the terminal when the panel size changes
            observer = new ResizeObserver(() => fit.fit());
            observer.observe(containerRef.current);

            termRef.current = term;
            setReady(true);
        };

        setup();

        return () => {
            disposed = true;
            observer?.disconnect();
            term?.dispose();
            termRef.current = null;
        };
    }, []);

    // 2. write each new step one time
    useEffect(() => {
        const term = termRef.current;

        if (!ready || !term) return;

        steps
            .filter((step) => step.taskId === taskId)
            .forEach((step) => {
                if (writtenRef.current.has(step.id)) return;

                writtenRef.current.add(step.id);

                const line = formatStep(step);
                if (line) term.writeln(line);
            });
    }, [steps, taskId, ready]);

    return <div ref={containerRef} className="h-full w-full" />;
}