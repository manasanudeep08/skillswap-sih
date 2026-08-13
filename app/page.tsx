"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  MessageCircle,
  Star,
  User,
  LogOut,
  Sparkles,
  Users,
  BookOpen,
  Activity,
  CircleHelp,
} from "lucide-react";

type UserData = {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string;
};

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
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


          {/* FIND YOUR MATCH */}

          <div className="mt-8">

            <Link
              href="/register"
              className="group relative inline-flex items-center gap-4 overflow-hidden rounded-[22px] border border-white/80 bg-white/30 px-3 py-3 pr-7 text-zinc-950 shadow-[0_8px_35px_rgba(85,65,170,0.22),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-[24px] transition-all duration-500 hover:-translate-y-1 hover:bg-white/40 hover:shadow-[0_18px_55px_rgba(85,65,170,0.32),inset_0_1px_2px_rgba(255,255,255,1)]"
            >

              <span className="pointer-events-none absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/70 via-white/10 to-transparent opacity-70" />

              <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-400/30 blur-2xl transition-all duration-500 group-hover:bg-violet-400/45" />

              <span className="pointer-events-none absolute -bottom-10 left-20 h-24 w-32 rounded-full bg-blue-400/20 blur-2xl transition-all duration-500 group-hover:bg-blue-400/35" />

              <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-violet-300/30" />

              <span className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-px bg-white/90 blur-[1px]" />

              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-white/30 bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700 text-white shadow-[0_8px_25px_rgba(109,72,220,0.38)] transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_10px_30px_rgba(109,72,220,0.50)]">

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
                className="relative ml-1 text-violet-600 transition-all duration-500 group-hover:translate-x-1 group-hover:text-violet-700"
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
              title="Exchange & rate"
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
    <main className="relative min-h-screen overflow-hidden bg-[#eef0f8] text-zinc-950">

      {/* BACKGROUND */}

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


      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/45 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill<span className="text-violet-600">
              Swap
            </span>
          </Link>


          <div className="hidden items-center gap-2 md:flex">

            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              Home
            </Link>

            <Link
              href="/skills"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              My Skills
            </Link>

            <Link
              href="/matches"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              Matches
            </Link>

          </div>


          {/* ACCOUNT */}

          <div className="flex items-center gap-3">

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/55 px-3 py-2 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
            >

              <Avatar avatar={user.avatar} />

              <div className="hidden text-left sm:block">

                <p className="text-sm font-black">
                  {user.username}
                </p>

                <p className="text-xs text-zinc-500">
                  View profile
                </p>

              </div>

            </Link>


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


      {/* DASHBOARD HERO */}

      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

          {/* LEFT */}

          <div>

            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-white/90 bg-white/50 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm backdrop-blur-xl">

              <Sparkles size={15} />

              Welcome back, {user.username}

            </div>


            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">

              Ready to find

              <span className="block text-violet-600">
                your exchange?
              </span>

            </h1>


            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-600">
              Tell us what you can teach and what you
              want to learn. SkillSwap will find people
              whose skills complement yours.
            </p>


            {/* MAIN CTA */}

            <div className="mt-8">

              <Link
                href="/skills"
                className="group relative inline-flex items-center gap-4 overflow-hidden rounded-[22px] border border-white/80 bg-white/35 px-3 py-3 pr-7 font-black shadow-[0_10px_40px_rgba(100,70,200,0.22)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:bg-white/55 hover:shadow-[0_18px_55px_rgba(100,70,200,0.32)]"
              >

                <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-violet-400/10" />

                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-400/25 blur-2xl transition group-hover:bg-violet-400/40" />

                <span className="relative grid h-12 w-12 place-items-center rounded-[16px] bg-gradient-to-br from-violet-500 via-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-500/30 transition group-hover:scale-105">

                  <Users size={20} />

                </span>

                <span className="relative">

                  <span className="block text-sm font-black">
                    Find My Match
                  </span>

                  <span className="mt-0.5 block text-xs font-medium text-zinc-500">
                    Start by adding your skills
                  </span>

                </span>

                <ArrowRight
                  size={18}
                  className="relative text-violet-600 transition group-hover:translate-x-1"
                />

              </Link>

            </div>

          </div>


          {/* PROFILE CARD */}

          <div className="rounded-[32px] border border-white/90 bg-white/45 p-7 shadow-[0_25px_80px_rgba(80,70,150,0.16)] backdrop-blur-2xl">

            <div className="flex items-center gap-5">

              <Avatar
                avatar={user.avatar}
                large
              />

              <div>

                <p className="text-sm font-bold text-violet-600">
                  YOUR PROFILE
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {user.username}
                </h2>

                {user.bio ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    {user.bio}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-400">
                    No bio added yet
                  </p>
                )}

              </div>

            </div>


            {/* DASHBOARD CARDS */}

            <div className="mt-7 grid grid-cols-2 gap-3">

              {/* HOW IT WORKS */}

              <Link
                href="#dashboard-info"
                className="group rounded-2xl border border-white bg-white/55 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-lg"
              >

                <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:scale-105">
                  <CircleHelp size={19} />
                </div>

                <p className="mt-3 text-sm font-black">
                  How it works
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  See how SkillSwap connects people.
                </p>

              </Link>


              {/* ACTIVITY */}

              <Link
                href="#dashboard-info"
                className="group rounded-2xl border border-white bg-white/55 p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/75 hover:shadow-lg"
              >

                <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-100 text-indigo-600 transition group-hover:scale-105">
                  <Activity size={19} />
                </div>

                <p className="mt-3 text-sm font-black">
                  Your activity
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Keep track of your exchanges.
                </p>

              </Link>

            </div>


            {/* PROFILE BUTTON */}

            <Link
              href="/profile"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
            >

              <User size={17} />

              Edit Profile

            </Link>

          </div>

        </div>

      </section>


      {/* DASHBOARD INFO */}

      <section
        id="dashboard-info"
        className="mx-auto max-w-7xl px-6 pb-16"
      >

        <div className="grid gap-5 md:grid-cols-2">

          {/* HOW IT WORKS */}

          <div className="rounded-[28px] border border-white/90 bg-white/45 p-7 shadow-sm backdrop-blur-2xl">

            <div className="flex items-center gap-4">

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                <Brain size={22} />
              </div>

              <div>

                <p className="text-xs font-black tracking-widest text-violet-600">
                  HOW IT WORKS
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Teach. Learn. Exchange.
                </h2>

              </div>

            </div>


            <div className="mt-6 space-y-4">

              <Step
                number="01"
                title="Add your skills"
                text="Tell us what you can teach and what you want to learn."
              />

              <Step
                number="02"
                title="Verify your skills"
                text="Use certificates or take a quick quiz to verify what you know."
              />

              <Step
                number="03"
                title="Find your exchange"
                text="We'll find people whose learning goals match your teaching skills."
              />

            </div>

          </div>


          {/* ACTIVITY */}

          <div className="rounded-[28px] border border-white/90 bg-white/45 p-7 shadow-sm backdrop-blur-2xl">

            <div className="flex items-center gap-4">

              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-600">
                <Activity size={22} />
              </div>

              <div>

                <p className="text-xs font-black tracking-widest text-indigo-600">
                  YOUR ACTIVITY
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Your SkillSwap journey
                </h2>

              </div>

            </div>


            <div className="mt-6 space-y-3">

              <ActivityRow
                icon={<BookOpen size={17} />}
                title="Skills"
                text="Add your teaching and learning skills"
                href="/skills"
              />

              <ActivityRow
                icon={<Users size={17} />}
                title="Matches"
                text="Discover people who complement your skills"
                href="/matches"
              />

              <ActivityRow
                icon={<Star size={17} />}
                title="Reputation"
                text="Build your profile through successful exchanges"
                href="/profile"
              />

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-white/70 px-6 py-10 text-center text-sm text-zinc-500">
        SkillSwap • Exchange knowledge, not money.
      </footer>

    </main>
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
   ACTIVITY ROW
   ========================================================= */

function ActivityRow({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white bg-white/55 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white/75 hover:shadow-md"
    >

      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600 transition group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-black">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-zinc-500">
          {text}
        </p>

      </div>

      <ArrowRight
        size={16}
        className="text-zinc-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
      />

    </Link>
  );
}


/* =========================================================
   STEP
   ========================================================= */

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-zinc-950 text-xs font-black text-white">
        {number}
      </div>

      <div>

        <p className="text-sm font-black">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {text}
        </p>

      </div>

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
  const avatars: Record<string, string> = {
    avatar1: "🧑‍💻",
    avatar2: "🎨",
    avatar3: "🎮",
    avatar4: "📚",
    avatar5: "🚀",
  };

  return (
    <div
      className={`grid ${
        large ? "h-20 w-20 text-4xl" : "h-10 w-10 text-lg"
      } place-items-center rounded-full border border-white bg-white/70 shadow-inner backdrop-blur-xl`}
    >
      {avatars[avatar] || "🧑‍💻"}
    </div>
  );
}