import { Suspense } from 'react';
import ProjectView from '@/components/ProjectView';

async function ProjectLoader({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProjectView projectId={id} />;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<div className="p-8 text-zinc-500">Loading...</div>}>
            <ProjectLoader params={params} />
        </Suspense>
    );
}