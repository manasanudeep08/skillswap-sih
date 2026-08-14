"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  LogOut,
  MessageCircle,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";

const avatars: Record<string, string> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

type UserData = {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string;
};

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  async function checkLogin() {
    try {
      const response = await fetch("/api/me");

      if (response.ok) {
        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (error) {
      console.error("Login check failed:", error);
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

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f3fb]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  return user ? (
    <LoggedInHome user={user} logout={logout} />
  ) : (
    <LoggedOutHome />
  );
}

/* =========================================================
   LOGGED OUT HOME
   ========================================================= */

function LoggedOutHome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f1f0f8] text-zinc-950">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-48 -top-48 h-[650px] w-[650px] rounded-full bg-violet-500/35 blur-[120px]" />

        <div className="absolute -right-48 -top-20 h-[620px] w-[620px] rounded-full bg-blue-500/30 blur-[120px]" />

        <div className="absolute bottom-[-320px] left-[30%] h-[680px] w-[680px] rounded-full bg-fuchsia-500/25 blur-[130px]" />

        <div className="absolute left-[38%] top-[20%] h-[350px] w-[350px] rounded-full bg-indigo-400/20 blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(70,60,110,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(70,60,110,0.8) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        <div className="absolute left-1/2 top-[32%] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-white/50 blur-[140px]" />

      </div>

      {/* NAVBAR */}

      <nav className="relative z-20 flex h-20 items-center justify-between border-b border-white/70 bg-white/45 px-6 backdrop-blur-2xl md:px-12">

        <Link
          href="/"
          className="text-2xl font-black tracking-tight"
        >
          Skill<span className="text-violet-600">Swap</span>
        </Link>

        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-white/60 md:block"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
          >
            Get Started
          </Link>

        </div>

      </nav>

      {/* HERO */}

      <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-12 md:grid-cols-2 md:px-12 md:pb-20 md:pt-16">

        <div className="flex flex-col justify-center">

          <div className="mb-5 w-fit rounded-full border border-violet-200/80 bg-white/50 px-4 py-2 text-xs font-bold tracking-[0.18em] text-violet-700 shadow-sm backdrop-blur-xl">
            LEARN • TEACH • EXCHANGE
          </div>

          <h1 className="text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">

            You teach what

            <span className="block text-violet-600">
              you know.
            </span>

            You learn what

            <span className="block text-violet-600">
              you don't.
            </span>

          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-600">
            SkillSwap connects people who can teach each
            other the skills they want to learn. No expensive
            courses. Just useful skills exchanged between
            real people.
          </p>

          <div className="mt-8">

            <Link
              href="/register"
              className="group relative inline-flex items-center gap-4 overflow-hidden rounded-[22px] border border-white/80 bg-white/30 px-3 py-3 pr-7 text-zinc-950 shadow-[0_8px_35px_rgba(85,65,170,0.22)] backdrop-blur-[24px] transition-all duration-500 hover:-translate-y-1 hover:bg-white/40"
            >

              <span className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/70 via-white/10 to-transparent opacity-70" />

              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700 text-white shadow-[0_8px_25px_rgba(109,72,220,0.38)] transition-all group-hover:scale-105">

                <Users size={20} />

              </span>

              <span className="relative">

                <span className="block text-sm font-black">
                  Find your match
                </span>

                <span className="mt-0.5 block text-xs font-medium text-zinc-500">
                  Discover your perfect skill exchange
                </span>

              </span>

              <ArrowRight
                size={18}
                className="relative ml-1 text-violet-600 transition-all group-hover:translate-x-1"
              />

            </Link>

          </div>

        </div>

        {/* MATCH PREVIEW */}

        <div className="flex items-center justify-center">

          <div className="w-full max-w-md rounded-[30px] border border-white/90 bg-white/45 p-6 shadow-[0_25px_80px_rgba(80,60,150,0.20)] backdrop-blur-2xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-xs font-bold tracking-[0.18em] text-zinc-400">
                  SMART MATCH
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Perfect exchange
                </h2>

              </div>

              <div className="rounded-full border border-green-200 bg-green-100/80 px-3 py-1 text-sm font-black text-green-700">
                96%
              </div>

            </div>

            <div className="rounded-2xl border border-white/90 bg-white/45 p-5 shadow-inner backdrop-blur-xl">

              <Person
                letter="R"
                name="Rahul"
                teaches="Video Editing"
                wants="Python"
                color="bg-violet-600"
              />

              <div className="my-5 flex items-center gap-3">

                <div className="h-px flex-1 bg-zinc-200/80" />

                <span className="font-black text-violet-600">
                  ↕
                </span>

                <div className="h-px flex-1 bg-zinc-200/80" />

              </div>

              <Person
                letter="M"
                name="Ramesh"
                teaches="Python"
                wants="Video Editing"
                color="bg-zinc-900"
              />

            </div>

            <Link
              href="/register"
              className="mt-5 block w-full rounded-xl bg-zinc-950 py-3 text-center font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >
              Start Exchange
            </Link>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
        className="relative z-10 border-y border-white/70 bg-white/55 px-6 py-20 backdrop-blur-xl"
      >

        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-black tracking-widest text-violet-600">
            HOW IT WORKS
          </p>

          <h2 className="mt-3 text-4xl font-black">
            A marketplace for knowledge.
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">

            <Feature
              icon={<Brain />}
              title="Tell us your skills"
              text="Add the skills you can teach and the skills you want to learn."
            />

            <Feature
              icon={<MessageCircle />}
              title="Find your match"
              text="Our matching system finds people with complementary skills."
            />

            <Feature
              icon={<Star />}
              title="Exchange & grow"
              text="Connect, learn together and build your reputation."
            />

          </div>

        </div>

      </section>

      <footer className="relative z-10 px-6 py-10 text-center text-sm text-zinc-500">
        SkillSwap • Exchange knowledge, not money.
      </footer>

    </main>
  );
}

/* =========================================================
   LOGGED IN HOME
   ========================================================= */

function LoggedInHome({
  user,
  logout,
}: {
  user: UserData;
  logout: () => void;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f4fa] text-zinc-950">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-48 top-[-150px] h-[500px] w-[500px] rounded-full bg-violet-300/25 blur-[130px]" />

        <div className="absolute right-[-180px] top-[180px] h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-[130px]" />

        <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-300/15 blur-[140px]" />

      </div>

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-zinc-200/70 bg-[#f5f4fa]/80 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Skill<span className="text-violet-600">
              Swap
            </span>
          </Link>

          {/* NAV LINKS */}

          <div className="hidden items-center gap-1 md:flex">

            <Link
              href="/"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-950 shadow-sm"
            >
              Home
            </Link>

            <Link
              href="/skills"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-500 transition hover:bg-white hover:text-zinc-950"
            >
              My Skills
            </Link>

            <Link
              href="/matches"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-500 transition hover:bg-white hover:text-zinc-950"
            >
              Matches
            </Link>

          </div>

          {/* PROFILE */}

          <div className="flex items-center gap-2">

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 shadow-sm transition hover:bg-white"
            >

              <Avatar avatar={user.avatar} />

              <div className="hidden text-left sm:block">

                <p className="text-sm font-black">
                  {user.username}
                </p>

                <p className="text-[11px] text-zinc-400">
                  View profile
                </p>

              </div>

            </Link>

            <button
              onClick={logout}
              title="Logout"
              className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-200/80 bg-white/80 text-zinc-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>

      </nav>

      {/* MAIN */}

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">

        {/* GREETING */}

        <div className="mb-10">

          <p className="text-sm font-bold text-violet-600">
            GOOD TO SEE YOU, {user.username}
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            What can you teach?
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-500">
            Add your skills, discover people with
            complementary skills, and start your next
            exchange.
          </p>

        </div>

        {/* MAIN DASHBOARD AREA */}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* EXCHANGE PANEL */}

          <div className="rounded-[30px] border border-white bg-white/65 p-7 shadow-[0_20px_70px_rgba(80,70,150,0.10)] backdrop-blur-xl">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-2">

                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600">
                    <Sparkles size={17} />
                  </div>

                  <p className="text-xs font-black tracking-[0.16em] text-violet-600">
                    YOUR SKILL EXCHANGE
                  </p>

                </div>

                <h2 className="mt-3 text-2xl font-black">
                  Build your exchange
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                  Tell SkillSwap what you offer and
                  what you're looking for.
                </p>

              </div>

              <Link
                href="/skills"
                className="flex w-fit items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-violet-700"
              >
                Manage Skills
                <ArrowRight size={16} />
              </Link>

            </div>

            {/* EXCHANGE */}

            <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">

              {/* TEACH */}

              <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black tracking-widest text-violet-500">
                      I CAN TEACH
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Your skills
                    </h3>

                  </div>

                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl shadow-sm">
                    🎓
                  </div>

                </div>

                <div className="mt-5 space-y-2">

                  <SkillPill
                    text="Python"
                    verified
                  />

                  <SkillPill text="Video Editing" />

                  <SkillPill
                    text="Add another skill"
                    add
                  />

                </div>

              </div>

              {/* EXCHANGE ICON */}

              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white bg-white text-violet-600 shadow-md">

                <ArrowRight
                  size={20}
                  className="hidden md:block"
                />

                <ArrowRight
                  size={20}
                  className="rotate-90 md:hidden"
                />

              </div>

              {/* LEARN */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black tracking-widest text-blue-500">
                      I WANT TO LEARN
                    </p>

                    <h3 className="mt-2 text-xl font-black">
                      Your goals
                    </h3>

                  </div>

                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl shadow-sm">
                    🎯
                  </div>

                </div>

                <div className="mt-5 space-y-2">

                  <SkillPill text="UI/UX Design" />

                  <SkillPill text="Python" />

                  <SkillPill
                    text="Add a learning goal"
                    add
                  />

                </div>

              </div>

            </div>

          </div>

          {/* MATCH CARD */}

          <div className="flex flex-col rounded-[30px] bg-zinc-950 p-7 text-white shadow-[0_25px_70px_rgba(30,25,50,0.20)]">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-black tracking-[0.18em] text-violet-400">
                  MATCHES
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Find your next match.
                </h2>

              </div>

              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                <Users size={19} />
              </div>

            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Discover people whose skills line up
              with what you want to learn.
            </p>

            {/* MATCH PREVIEW */}

            <div className="mt-7 flex-1 rounded-2xl border border-white/10 bg-white/5 p-5">

              <div className="flex items-center gap-4">

                <div className="grid h-12 w-12 place-items-center rounded-full bg-violet-600 font-black">
                  R
                </div>

                <div>

                  <p className="font-black">
                    Rahul
                  </p>

                  <p className="text-xs text-zinc-500">
                    Video Editing → Python
                  </p>

                </div>

              </div>

              <div className="my-5 flex items-center gap-3">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs font-black text-violet-400">
                  96%
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              <div className="flex items-center gap-4">

                <div className="grid h-12 w-12 place-items-center rounded-full bg-white font-black text-zinc-950">
                  M
                </div>

                <div>

                  <p className="font-black">
                    You
                  </p>

                  <p className="text-xs text-zinc-500">
                    Python → Video Editing
                  </p>

                </div>

              </div>

            </div>

            <Link
              href="/matches"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-black text-zinc-950 transition hover:bg-violet-500 hover:text-white"
            >
              View Matches
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

        {/* LOWER SECTION */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* QUICK ACTIONS */}

          <div className="rounded-[28px] border border-white bg-white/60 p-6 shadow-sm backdrop-blur-xl">

            <p className="text-xs font-black tracking-[0.16em] text-zinc-400">
              QUICK ACTIONS
            </p>

            <div className="mt-5 space-y-3">

              <QuickAction
                href="/skills"
                icon={<Sparkles size={18} />}
                title="Manage your skills"
                text="Add or update what you know."
              />

              <QuickAction
                href="/matches"
                icon={<Users size={18} />}
                title="Browse matches"
                text="See people you could learn from."
              />

              <QuickAction
                href="/profile"
                icon={<User size={18} />}
                title="View your profile"
                text="Update your public information."
              />

            </div>

          </div>

          {/* VERIFICATION */}

          <div className="rounded-[28px] border border-white bg-white/60 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>

              <div>

                <p className="text-xs font-black tracking-widest text-zinc-400">
                  TRUST
                </p>

                <h3 className="font-black">
                  Verify your skills
                </h3>

              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-500">
              Show other users that you actually know
              the skills you're offering.
            </p>

            <Link
              href="/skills/verify"
              className="mt-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold transition hover:border-violet-200 hover:text-violet-600"
            >
              Take an assessment
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* PROFILE SHORTCUT */}

          <div className="rounded-[28px] border border-white bg-white/60 p-6 shadow-sm backdrop-blur-xl">

            <div className="flex items-center gap-4">

              <Avatar
                avatar={user.avatar}
                large
              />

              <div>

                <p className="text-xs font-black tracking-widest text-violet-600">
                  YOUR SPACE
                </p>

                <h3 className="mt-1 text-xl font-black">
                  {user.name}
                </h3>

                <p className="text-sm text-zinc-500">
                  @{user.username}
                </p>

              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-500">
              Keep your profile updated so other users
              know who they're exchanging skills with.
            </p>

            <Link
              href="/profile"
              className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold shadow-sm transition hover:bg-zinc-50"
            >

              View Profile

              <ArrowRight size={16} />

            </Link>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="border-t border-zinc-200/70 px-6 py-8 text-center text-sm text-zinc-400">
        SkillSwap • Exchange knowledge, not money.
      </footer>

    </main>
  );
}

/* =========================================================
   SKILL PILL
   ========================================================= */

function SkillPill({
  text,
  verified = false,
  add = false,
}: {
  text: string;
  verified?: boolean;
  add?: boolean;
}) {
  if (add) {
    return (
      <Link
        href="/skills"
        className="flex items-center justify-between rounded-xl border border-dashed border-zinc-300 bg-white/50 px-4 py-3 text-sm font-bold text-zinc-400 transition hover:border-violet-300 hover:text-violet-600"
      >
        <span>{text}</span>

        <span className="text-lg">
          +
        </span>

      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-white bg-white/75 px-4 py-3">

      <span className="text-sm font-bold">
        {text}
      </span>

      {verified && (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">

          <CheckCircle2 size={13} />

          Verified

        </span>
      )}

    </div>
  );
}

/* =========================================================
   QUICK ACTION
   ========================================================= */

function QuickAction({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white bg-white/60 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
    >

      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-black">
          {title}
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          {text}
        </p>

      </div>

      <ArrowRight
        size={16}
        className="text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
      />

    </Link>
  );
}

/* =========================================================
   PERSON
   ========================================================= */

function Person({
  letter,
  name,
  teaches,
  wants,
  color,
}: {
  letter: string;
  name: string;
  teaches: string;
  wants: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">

      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${color} font-black text-white shadow-lg`}
      >
        {letter}
      </div>

      <div>

        <p className="font-bold">
          {name}
        </p>

        <p className="text-sm text-zinc-500">
          Teaches {teaches}
        </p>

        <p className="text-sm text-zinc-500">
          Wants {wants}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   FEATURE
   ========================================================= */

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-[#f7f7f2] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-violet-100 text-violet-600">
        {icon}
      </div>

      <h3 className="text-xl font-black">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-zinc-600">
        {text}
      </p>

    </div>
  );
}

/* =========================================================
   AVATAR
   ========================================================= */

function Avatar({
  avatar,
  large = false,
}: {
  avatar: string;
  large?: boolean;
}) {
  return (
    <div
      className={`grid ${
        large
          ? "h-14 w-14 text-2xl"
          : "h-9 w-9 text-base"
      } place-items-center rounded-full border border-white bg-white/80 shadow-inner`}
    >
      {avatars[avatar] || "🧑‍💻"}
    </div>
  );
}