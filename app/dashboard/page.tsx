"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const avatars: Record<string, string> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/me");

        if (!response.ok) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7fb]">
        <p className="font-semibold text-zinc-500">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-zinc-950">

      {/* Navigation */}
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Skill<span className="text-violet-600">Swap</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-full px-3 py-2 transition hover:bg-zinc-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-xl">
              {avatars[user.avatar] || "🧑‍💻"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold">
                {user.name}
              </p>

              <p className="text-xs text-zinc-500">
                @{user.username}
              </p>
            </div>
          </Link>

        </div>
      </nav>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-6 py-12">

        <div className="mb-10">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-violet-600">
            Your SkillSwap
          </p>

          <h1 className="text-4xl font-black tracking-tight">
            Hey, {user.name} 👋
          </h1>

          <p className="mt-3 max-w-xl text-zinc-500">
            Build your skill profile, discover people to learn from,
            and share what you know.
          </p>
        </div>

        {/* Profile card */}
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="flex items-start gap-5">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-4xl">
              {avatars[user.avatar] || "🧑‍💻"}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {user.name}
              </h2>

              <p className="font-semibold text-violet-600">
                @{user.username}
              </p>

              {user.bio ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                  {user.bio}
                </p>
              ) : (
                <p className="mt-3 text-sm text-zinc-400">
                  You haven't added a bio yet.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* Next steps */}
        <div className="grid gap-5 md:grid-cols-2">

          <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              🎓
            </div>

            <h2 className="text-xl font-black">
              What can you teach?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Add the skills you're confident teaching to other people.
            </p>

            <button className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700">
              Add teaching skills →
            </button>

          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              🧠
            </div>

            <h2 className="text-xl font-black">
              What do you want to learn?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Tell SkillSwap what you're interested in learning.
            </p>

            <button className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800">
              Add learning goals →
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}