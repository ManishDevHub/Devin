"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("Login form submitted!");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-[#111114] p-8 shadow-2xl shadow-black/40"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Log in to continue to your account
          </p>
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-[#09090b] p-3 text-white placeholder-gray-500 outline-none transition focus:border-violet-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-white/10 bg-[#09090b] p-3 text-white placeholder-gray-500 outline-none transition focus:border-violet-500"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-violet-600 p-3 font-semibold text-white transition hover:bg-violet-500"
        >
          Log in
        </button>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}