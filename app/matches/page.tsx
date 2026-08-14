"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatar: string;
};

type SkillMatch = {
  mine: string;
  theirs: string;
  verified: boolean;
};

type Match = {
  user: User;
  score: number;
  learnFromThem: SkillMatch[];
  learnFromMe: SkillMatch[];
  totalMatches: number;
};

const avatars: Record<string, string> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

export default function MatchesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    try {
      /*
       * Get currently logged-in user.
       */
      const meResponse = await fetch("/api/me");

      if (!meResponse.ok) {
        window.location.href = "/login";
        return;
      }

      const meData = await meResponse.json();

      if (!meData.user) {
        window.location.href = "/login";
        return;
      }

      setUser(meData.user);

      /*
       * Find matches for this user.
       */
      const matchesResponse = await fetch(
        `/api/matches?userId=${meData.user.id}`
      );

      const matchesData = await matchesResponse.json();

      if (!matchesResponse.ok) {
        setError(
          matchesData.error ||
            "Unable to find matches."
        );
        return;
      }

      setMatches(matchesData.matches || []);
    } catch (error) {
      console.error("Matches loading error:", error);

      setError(
        "Something went wrong while finding matches."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="mt-4 text-sm font-bold text-zinc-500">
            Finding your matches...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef0f8] text-zinc-950">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-40 top-[-100px] h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[130px]" />

        <div className="absolute right-[-180px] top-[100px] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[130px]" />

        <div className="absolute bottom-[-250px] left-[35%] h-[600px] w-[600px] rounded-full bg-fuchsia-400/15 blur-[140px]" />

      </div>

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/60 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Skill<span className="text-violet-600">
              Swap
            </span>
          </Link>

          <div className="flex items-center gap-2">

            <Link
              href="/skills"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-zinc-500 transition hover:bg-white hover:text-zinc-950 sm:block"
            >
              My Skills
            </Link>

            <Link
              href="/profile"
              className="rounded-xl border border-white bg-white/70 px-4 py-2 text-sm font-bold text-zinc-600 shadow-sm transition hover:bg-white"
            >
              Profile
            </Link>

          </div>

        </div>

      </nav>

      {/* MAIN */}

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">

        {/* HEADER */}

        <div className="mb-10">

          <Link
            href="/"
            className="mb-6 flex w-fit items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          <div className="flex items-start gap-4">

            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm">
              <Users size={25} />
            </div>

            <div>

              <p className="text-sm font-black tracking-[0.2em] text-violet-600">
                YOUR MATCHES
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                Find your skill exchange.
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-500">
                We look for people who can teach what
                you want to learn and want to learn
                something you can teach.
              </p>

            </div>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* NO MATCHES */}

        {!error && matches.length === 0 && (
          <div className="rounded-[30px] border border-white bg-white/60 px-6 py-16 text-center shadow-xl shadow-violet-200/20 backdrop-blur-xl">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-violet-600">
              <Sparkles size={28} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              We need a little more to work with.
            </h2>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-zinc-500">
              Add at least one skill you can teach
              and one skill you want to learn. Once
              other users have complementary skills,
              they'll appear here.
            </p>

            <Link
              href="/skills"
              className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-violet-700"
            >
              Add Your Skills
              <ArrowRight size={17} />
            </Link>

          </div>
        )}

        {/* MATCH COUNT */}

        {matches.length > 0 && (
          <div className="mb-5 flex items-center justify-between">

            <p className="text-sm font-bold text-zinc-500">
              {matches.length}{" "}
              {matches.length === 1
                ? "potential match"
                : "potential matches"}{" "}
              found
            </p>

            <div className="rounded-full border border-white bg-white/70 px-3 py-1.5 text-xs font-bold text-zinc-500 shadow-sm">
              Sorted by compatibility
            </div>

          </div>
        )}

        {/* MATCHES */}

        <div className="grid gap-5">

          {matches.map((match) => (
            <MatchCard
              key={match.user.id}
              match={match}
            />
          ))}

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/70 px-6 py-10 text-center text-sm text-zinc-400">
        SkillSwap • Exchange knowledge, not money.
      </footer>

    </main>
  );
}


/* =========================================================
   MATCH CARD
   ========================================================= */

function MatchCard({
  match,
}: {
  match: Match;
}) {
  const { user, score } = match;

  const scoreLabel =
    score >= 85
      ? "Excellent match"
      : score >= 65
      ? "Strong match"
      : score >= 45
      ? "Potential match"
      : "Some overlap";

  return (
    <article className="rounded-[28px] border border-white bg-white/65 p-6 shadow-xl shadow-violet-200/10 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

      {/* TOP */}

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

        <div className="flex items-center gap-4">

          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white bg-white text-2xl shadow-sm">
            {avatars[user.avatar] || "🧑‍💻"}
          </div>

          <div>

            <h2 className="text-xl font-black">
              {user.name}
            </h2>

            <p className="text-sm text-zinc-400">
              @{user.username}
            </p>

            {user.bio && (
              <p className="mt-2 max-w-lg text-sm text-zinc-500">
                {user.bio}
              </p>
            )}

          </div>

        </div>

        {/* SCORE */}

        <div className="flex items-center gap-3">

          <div className="text-right">

            <p className="text-xs font-bold text-zinc-400">
              {scoreLabel}
            </p>

            <p className="text-3xl font-black text-violet-600">
              {score}%
            </p>

          </div>

          <div
            className="grid h-14 w-14 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#7c3aed ${score}%, #e9e7f2 0)`,
            }}
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-xs font-black">
              {score}
            </div>
          </div>

        </div>

      </div>

      {/* EXCHANGE */}

      <div className="mt-7 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">

        {/* THEY TEACH */}

        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5">

          <p className="text-xs font-black tracking-[0.15em] text-violet-600">
            THEY CAN TEACH YOU
          </p>

          <div className="mt-4 space-y-2">

            {match.learnFromThem.length > 0 ? (
              match.learnFromThem.map((skill, index) => (
                <div
                  key={`${skill.mine}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-white bg-white/75 px-4 py-3"
                >

                  <span className="text-sm font-bold">
                    {skill.theirs}
                  </span>

                  {skill.verified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                  )}

                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No direct learning match.
              </p>
            )}

          </div>

        </div>

        {/* EXCHANGE */}

        <div className="mx-auto flex items-center">

          <div className="grid h-11 w-11 place-items-center rounded-full border border-white bg-white text-violet-600 shadow-md">

            <ArrowRight
              size={18}
              className="hidden md:block"
            />

            <ArrowRight
              size={18}
              className="rotate-90 md:hidden"
            />

          </div>

        </div>

        {/* YOU TEACH */}

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">

          <p className="text-xs font-black tracking-[0.15em] text-blue-600">
            YOU CAN TEACH THEM
          </p>

          <div className="mt-4 space-y-2">

            {match.learnFromMe.length > 0 ? (
              match.learnFromMe.map((skill, index) => (
                <div
                  key={`${skill.mine}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-white bg-white/75 px-4 py-3"
                >

                  <span className="text-sm font-bold">
                    {skill.mine}
                  </span>

                  {skill.verified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 size={13} />
                      Verified
                    </span>
                  )}

                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-400">
                No direct teaching match.
              </p>
            )}

          </div>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="mt-6 flex flex-col gap-3 border-t border-zinc-200/70 pt-5 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-zinc-400">
          {match.totalMatches}{" "}
          {match.totalMatches === 1
            ? "skill connection"
            : "skill connections"}{" "}
          found
        </p>

        <div className="flex gap-3">

          <button
            disabled
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-400"
            title="Exchange requests are coming next"
          >
            <MessageCircle size={16} />
            Request Exchange
          </button>

        </div>

      </div>

    </article>
  );
}