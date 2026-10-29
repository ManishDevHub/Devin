"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Project } from "@/types";
import Sidebar from "@/components/Sidebar";

const suggestions = [
  {
    title: "Build an application",
    description: "Create a full-stack application.",
    prompt:
      "Build a full-stack task management application with authentication and a database.",
  },
  {
    title: "Fix a bug",
    description: "Debug and fix an existing issue.",
    prompt:
      "Analyze my existing codebase, find the root cause of a bug, and implement a fix.",
  },
  {
    title: "Add a feature",
    description: "Extend your existing project.",
    prompt:
      "Analyze my project and implement a responsive dashboard with reusable components.",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [username, setUsername] = useState("");
  const [projectId, setProjectId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }

    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUsername(user.username || user.name || "Developer");
        } catch {
          setUsername("Developer");
        }
      }

      const { ok, status, data } = await apiFetch("/api/projects/all");

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!ok) {
        setError(data?.message || "Unable to load projects.");
        return;
      }

      const list: Project[] = data.projects ?? [];
      setProjects(list);
      setProjectId((current) =>
        list.some((project) => project.id === current)
          ? current
          : list[0]?.id ?? ""
      );
    } catch {
      setError("Cannot connect to the server.");
    } finally {
      setLoadingProjects(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  // Returns false when the backend cannot create the project.
  const handleCreateProject = async (name: string): Promise<boolean> => {
    setError("");

    try {
      const { ok, status, data } = await apiFetch("/api/projects/create", "POST", {
        name,
      });

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return false;
      }

      if (!ok || !data?.project?.id) {
        setError(data?.message || "Unable to create the project.");
        return false;
      }

      const created: Project = data.project;

      setProjects((current) => [
        created,
        ...current.filter((project) => project.id !== created.id),
      ]);
      setProjectId(created.id);

      return true;
    } catch {
      setError("Cannot connect to the server.");
      return false;
    }
  };

  const handleStartTask = async () => {
    if (loading) return;

    setError("");

    if (!projectId) {
      setError("Create a project before starting a task.");
      return;
    }

    if (prompt.trim().length < 5) {
      setError("Please describe your task in at least 5 characters.");
      return;
    }

    setLoading(true);

    try {
      const { ok, status, data } = await apiFetch("/api/tasks/create", "POST", {
        projectId,
        prompt: prompt.trim(),
      });

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      if (!ok) {
        setError(data?.message || "Unable to start the task.");
        return;
      }

      if (!data?.task?.id) {
        setError("The server did not return a task ID.");
        return;
      }

      router.push(
        `/project/${encodeURIComponent(projectId)}?taskId=${encodeURIComponent(data.task.id)}`
      );
    } catch {
      setError("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[#09090b] text-zinc-100">
      <Sidebar
        projects={projects}
        username={username}
        activeId={projectId}
        onCreate={handleCreateProject}
        onLogout={handleLogout}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden pt-14 md:pt-0">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] px-5 sm:px-8">
          <div>
            <p className="text-xs text-zinc-500">Workspace / Overview</p>
            <h1 className="text-sm font-semibold">Dashboard</h1>
          </div>

          <div
            title={username || "Developer"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-xs font-semibold text-violet-300"
          >
            {(username || "D").charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4 sm:px-8">
          <section className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col justify-center">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-xl text-violet-300">
                ✳
              </div>

              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                What are we building?
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-400">
                Describe your goal and let your AI engineering workflow get
                started.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111114] p-3 transition-colors focus-within:border-violet-500/40">
              <textarea
                rows={4}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.metaKey)
                  ) {
                    event.preventDefault();
                    void handleStartTask();
                  }
                }}
                placeholder="Describe the software you want to build..."
                className="max-h-32 min-h-20 w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-zinc-600"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
                <label className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
                  Project
                  <select
                    value={projectId}
                    onChange={(event) => setProjectId(event.target.value)}
                    disabled={projects.length === 0 || loadingProjects}
                    className="max-w-48 rounded-lg border border-white/10 bg-[#19191d] px-2 py-2 text-xs text-zinc-200 outline-none focus:border-violet-500/50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingProjects ? "Loading..." : "Create a project first"}
                    </option>

                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => void handleStartTask()}
                  disabled={loading || loadingProjects || !projectId}
                  className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Starting..." : "Start building ↗"}
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-[11px] text-zinc-600">
              Press Ctrl + Enter to submit
            </p>

            {error && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-300">
                  Start with an idea
                </h3>
                <span className="text-xs text-zinc-600">Quick prompts</span>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {suggestions.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setPrompt(item.prompt)}
                    className="rounded-xl border border-white/[0.07] bg-[#101012] p-3 text-left transition hover:border-violet-400/30 hover:bg-[#151319]"
                  >
                    <span className="block text-sm font-medium text-zinc-200">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs leading-4 text-zinc-500">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto mt-4 w-full max-w-4xl shrink-0 border-t border-white/[0.07] pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">
                Recent projects
              </h3>
              <span className="text-xs text-zinc-500">
                {projects.length} total
              </span>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-zinc-500">
                No projects yet. Select <strong>+ New project</strong> in the
                sidebar to create one.
              </p>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/project/${encodeURIComponent(project.id)}`}
                    className="min-w-0 max-w-52 flex-1 rounded-lg border border-white/[0.07] bg-[#101012] px-3 py-2 transition hover:border-violet-400/30"
                  >
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {project.name}
                    </p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      Open project ↗
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}