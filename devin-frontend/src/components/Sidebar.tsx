"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@/types";

interface SidebarProps {
  projects: Project[];
  username: string;
  activeId?: string;
  onCreate: (name: string) => Promise<boolean>;
  onLogout: () => void;
}

export default function Sidebar({
  projects,
  username,
  activeId,
  onCreate,
  onLogout,
}: SidebarProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formError, setFormError] = useState("");

const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const trimmedName = name.trim();

  if (!trimmedName || creating) return;

  setCreating(true);
  setFormError("");

  try {
    const success = await onCreate(trimmedName);

    if (success) {
      setName("");
      setShowForm(false);
    } else {
      setFormError("Project creation failed. Check the error on the dashboard.");
    }
  } catch {
    setFormError("Something went wrong. Please try again.");
  } finally {
    setCreating(false);
  }
};

  const panel = (
    <>
      <Link
        href="/dashboard"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-xl text-violet-300">
          ✳
        </span>

        <span>
          <span className="block text-sm font-semibold tracking-wide text-white">
            Devin
          </span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            AI engineering
          </span>
        </span>
      </Link>

      <div className="p-3">
        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3"
          >
            <label
              htmlFor="project-name"
              className="block text-xs font-medium text-zinc-400"
            >
              New project
            </label>

            <input
              id="project-name"
              autoFocus
              maxLength={100}
              type="text"
              placeholder="My awesome project"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#09090b] px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60"
            />

            {formError && (
              <p role="alert" className="text-xs text-red-400">
                {formError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating || !name.trim()}
                className="flex-1 rounded-lg bg-violet-600 py-2 text-xs font-medium text-white transition hover:bg-violet-500 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setFormError("");
                }}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-violet-400/30 hover:bg-violet-500/10"
          >
            <span className="text-lg text-violet-300">+</span>
            New project
            <span className="ml-auto text-[10px] text-zinc-600">⌘ N</span>
          </button>
        )}
      </div>

      <nav className="px-3 pb-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
          Workspace
        </p>

        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg bg-white/[0.06] px-3 py-2.5 text-sm text-zinc-200"
        >
          <span className="text-base text-violet-300">▦</span>
          Overview
        </Link>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
            Your projects
          </p>
          <span className="text-[10px] text-zinc-600">
            {projects.length}
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="px-3 py-3 text-xs leading-5 text-zinc-600">
            Your projects will appear here after you create one.
          </p>
        ) : (
          <div className="space-y-1">
            {projects.map((project) => {
              const active = project.id === activeId;

              return (
                <Link
                  key={project.id}
                  href={`/project/${encodeURIComponent(project.id)}`}
                  onClick={() => setMobileOpen(false)}
                  title={project.name}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    active
                      ? "border border-violet-400/15 bg-violet-500/10 text-violet-200"
                      : "border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <span className="shrink-0 text-sm text-zinc-500">◈</span>
                  <span className="min-w-0 flex-1 truncate">
                    {project.name}
                  </span>
                  {active && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-200">
            {(username || "D").charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-200">
              {username || "Developer"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Personal workspace
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
          >
            ↗
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0d10] md:flex">
        {panel}
      </aside>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0d0d10]/95 px-4 backdrop-blur-xl">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-white"
          >
            <span className="text-lg text-violet-300">✳</span>
            Devin
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300"
          >
            {mobileOpen ? "Close" : "☰ Menu"}
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <aside className="flex h-full w-72 max-w-[85vw] flex-col border-r border-white/10 bg-[#0d0d10] shadow-2xl">
              <div className="flex items-center justify-end border-b border-white/[0.07] px-3 py-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  Close ✕
                </button>
              </div>
              {panel}
            </aside>

            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="flex-1 bg-black/60"
            />
          </div>
        )}
      </div>
    </>
  );
}