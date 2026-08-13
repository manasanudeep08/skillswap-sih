    "use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      window.location.href = "/";
    } catch {
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-zinc-950">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Logo */}
          <Link
            href="/"
            className="mb-8 block text-center text-3xl font-black tracking-tight text-zinc-950"
          >
            Skill<span className="text-violet-600">Swap</span>
          </Link>

          {/* Card */}
          <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(30,20,60,0.08)] sm:p-10">

            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-700">
                WELCOME BACK
              </div>

              <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                Log in to SkillSwap
              </h1>

              <p className="mt-3 text-[15px] leading-6 text-zinc-500">
                Continue learning, teaching, and exchanging skills.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-900">
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 hover:shadow-violet-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log In"}

                {!loading && (
                  <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

            </form>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />

              <span className="text-xs font-semibold text-zinc-400">
                OR
              </span>

              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            {/* Register */}
            <p className="text-center text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-violet-600 transition hover:text-violet-700 hover:underline"
              >
                Create one
              </Link>
            </p>

          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs font-medium text-zinc-400">
            Learn what you know. Discover what you don't.
          </p>

        </div>
      </div>
    </main>
  );
}