"use client";

import Link from "next/link";
import { useState } from "react";

const avatars = [
  { id: "avatar1", emoji: "🧑‍💻" },
  { id: "avatar2", emoji: "🎨" },
  { id: "avatar3", emoji: "🎮" },
  { id: "avatar4", emoji: "📚" },
  { id: "avatar5", emoji: "🚀" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("avatar1");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          bio,
          avatar,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      alert("Account created successfully!");

      window.location.href = "/login";
    } catch {
      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-zinc-950">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          <Link
            href="/"
            className="mb-8 block text-center text-3xl font-black tracking-tight text-zinc-950"
          >
            Skill<span className="text-violet-600">Swap</span>
          </Link>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(30,20,60,0.08)] sm:p-10">

            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-700">
                JOIN SKILLSWAP
              </div>

              <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                Create your account
              </h1>

              <p className="mt-3 text-[15px] leading-6 text-zinc-500">
                Tell us a little about yourself before you start swapping skills.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Username
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-zinc-400">
                    @
                  </span>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase())
                    }
                    placeholder="yourusername"
                    required
                    minLength={3}
                    className="h-12 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>

                <p className="mt-1.5 text-xs text-zinc-400">
                  Letters, numbers and underscores only.
                </p>
              </div>

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
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

                <p className="mt-1.5 text-xs text-zinc-400">
                  Minimum 6 characters.
                </p>
              </div>

              {/* Bio */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-900">
                    Bio
                  </label>

                  <span className="text-xs font-medium text-zinc-400">
                    Optional
                  </span>
                </div>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people a little about yourself..."
                  maxLength={160}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[16px] font-medium text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

                <p className="mt-1 text-right text-xs text-zinc-400">
                  {bio.length}/160
                </p>
              </div>

              {/* Avatar */}
              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-900">
                  Choose your avatar
                </label>

                <div className="grid grid-cols-5 gap-3">
                  {avatars.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatar(item.id)}
                      className={`flex aspect-square items-center justify-center rounded-2xl border text-2xl transition ${
                        avatar === item.id
                          ? "border-violet-500 bg-violet-50 ring-4 ring-violet-500/10"
                          : "border-zinc-200 bg-zinc-50 hover:border-violet-300 hover:bg-violet-50"
                      }`}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}

                {!loading && (
                  <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>

            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />

              <span className="text-xs font-semibold text-zinc-400">
                OR
              </span>

              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-violet-600 hover:text-violet-700 hover:underline"
              >
                Log in
              </Link>
            </p>

          </div>

          <p className="mt-6 text-center text-xs font-medium text-zinc-400">
            Learn what you know. Discover what you don't.
          </p>

        </div>
      </div>
    </main>
  );
}