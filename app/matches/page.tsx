"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LogOut,
  MessageCircle,
  Sparkles,
  Users,
  X,
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

  const [sentRequests, setSentRequests] = useState<
    Record<number, boolean>
  >({});

  const [sendingRequest, setSendingRequest] = useState<
    Record<number, boolean>
  >({});

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast]);

  async function loadMatches() {
    try {
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
      console.error(
        "Matches loading error:",
        error
      );

      setError(
        "Something went wrong while finding matches."
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  async function sendExchangeRequest(
    receiverId: number
  ) {
    if (!user) {
      return;
    }

    if (sentRequests[receiverId]) {
      return;
    }

    if (sendingRequest[receiverId]) {
      return;
    }

    setSendingRequest((current) => ({
      ...current,
      [receiverId]: true,
    }));

    try {
      const response = await fetch(
        "/api/exchange-requests/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: user.id,
            receiverId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setSentRequests((current) => ({
            ...current,
            [receiverId]: true,
          }));
        }

        setToast({
          type: "error",
          message:
            data.error ||
            "Unable to send exchange request.",
        });

        return;
      }

      setSentRequests((current) => ({
        ...current,
        [receiverId]: true,
      }));

      setToast({
        type: "success",
        message:
          "Exchange request sent successfully.",
      });
    } catch (error) {
      console.error(
        "Exchange request error:",
        error
      );

      setToast({
        type: "error",
        message:
          "Something went wrong. Please try again.",
      });
    } finally {
      setSendingRequest((current) => ({
        ...current,
        [receiverId]: false,
      }));
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

      {/* =====================================================
          BACKGROUND
          ===================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(139,92,246,0.30),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,0.22),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(217,70,239,0.18),transparent_35%)]" />

        <div className="absolute left-[-150px] top-[100px] h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[130px]" />

        <div className="absolute right-[-180px] top-[200px] h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(80,70,120,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(80,70,120,0.7) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>


      {/* =====================================================
          REQUEST TOAST
          ===================================================== */}

      {toast && (
        <div className="fixed right-5 top-5 z-[100] w-[calc(100%-40px)] max-w-sm">

          <div
            className={`relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-2xl backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-200"
                : "border-red-200"
            }`}
          >

            <div className="flex items-start gap-3">

              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                  toast.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <X size={20} />
                )}
              </div>

              <div className="min-w-0 flex-1">

                <p className="text-sm font-black">
                  {toast.type === "success"
                    ? "Request Sent"
                    : "Request Failed"}
                </p>

                <p className="mt-1 text-sm leading-5 text-zinc-500">
                  {toast.message}
                </p>

              </div>

              <button
                onClick={() => setToast(null)}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X size={15} />
              </button>

            </div>

            <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden bg-zinc-100">

              <div
                className={`h-full animate-[toastProgress_5s_linear_forwards] ${
                  toast.type === "success"
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          NAVBAR
          SAME STRUCTURE AS HOME
          ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/45 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill
            <span className="text-violet-600">
              Swap
            </span>
          </Link>


          {/* NAVIGATION */}

          <div className="hidden items-center gap-2 md:flex">

            {/* HOME */}

            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              Home
            </Link>


            {/* MY SKILLS */}

            <Link
              href="/skills"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              My Skills
            </Link>


            {/* MATCHES - ACTIVE */}

            <Link
              href="/matches"
              className="rounded-xl bg-violet-100 px-4 py-2 text-sm font-black text-violet-700 shadow-sm transition hover:bg-violet-100"
            >
              Matches
            </Link>


            {/* REQUESTS */}

            <Link
              href="/requests"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              Requests
            </Link>

          </div>


          {/* ACCOUNT */}

          <div className="flex items-center gap-3">

            {/* PROFILE CARD */}

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/55 px-3 py-2 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
            >

              <Avatar avatar={user?.avatar || "avatar1"} />

              <div className="hidden text-left sm:block">

                <p className="text-sm font-black">
                  {user?.username || "User"}
                </p>

                <p className="text-xs text-zinc-500">
                  View profile
                </p>

              </div>

            </Link>


            {/* LOGOUT */}

            <button
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/90 bg-white/55 text-zinc-500 shadow-sm backdrop-blur-xl transition hover:bg-red-50 hover:text-red-500"
              title="Logout"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </nav>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">

        {/* PAGE HEADER */}

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


        {/* MATCH CARDS */}

        <div className="grid gap-5">

          {matches.map((match) => (

            <MatchCard
              key={match.user.id}
              match={match}
              sent={
                !!sentRequests[
                  match.user.id
                ]
              }
              sending={
                !!sendingRequest[
                  match.user.id
                ]
              }
              onSendRequest={
                sendExchangeRequest
              }
            />

          ))}

        </div>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="border-t border-white/70 px-6 py-10 text-center text-sm text-zinc-400">
        SkillSwap • Exchange knowledge, not money.
      </footer>


      {/* =====================================================
          TOAST ANIMATION
          ===================================================== */}

      <style jsx global>{`
        @keyframes toastProgress {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }
      `}</style>

    </main>
  );
}


/* =========================================================
   MATCH CARD
   ========================================================= */

function MatchCard({
  match,
  sent,
  sending,
  onSendRequest,
}: {
  match: Match;
  sent: boolean;
  sending: boolean;
  onSendRequest: (
    receiverId: number
  ) => void;
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
              background:
                `conic-gradient(#7c3aed ${score}%, #e9e7f2 0)`,
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

              match.learnFromThem.map(
                (skill, index) => (

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

                )
              )

            ) : (

              <p className="text-sm text-zinc-400">
                No direct learning match.
              </p>

            )}

          </div>

        </div>


        {/* ARROW */}

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

              match.learnFromMe.map(
                (skill, index) => (

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

                )
              )

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


        <div className="flex flex-wrap gap-3">

          {/* VIEW PROFILE */}

          <Link
            href={`/profile?userId=${user.id}`}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <Users size={16} />
            View Profile
          </Link>


          {/* REQUEST EXCHANGE */}

          {sent ? (

            <button
              disabled
              className="flex cursor-default items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-600"
            >
              <CheckCircle2 size={16} />
              Request Sent
            </button>

          ) : (

            <button
              onClick={() =>
                onSendRequest(user.id)
              }
              disabled={sending}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-black text-white shadow-lg transition ${
                sending
                  ? "cursor-wait bg-zinc-400"
                  : "bg-zinc-950 hover:bg-violet-700"
              }`}
            >

              <MessageCircle size={16} />

              {sending
                ? "Sending..."
                : "Request Exchange"}

            </button>

          )}

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   AVATAR
   Same avatar style used by Home
   ========================================================= */

function Avatar({
  avatar,
}: {
  avatar: string;
}) {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-full border border-white bg-white/70 text-lg shadow-inner backdrop-blur-xl">
      {avatars[avatar] || "🧑‍💻"}
    </div>
  );
}