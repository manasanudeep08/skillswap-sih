"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Award,
  Check,
  Home,
  RotateCcw,
  Sparkles,
} from "lucide-react";

function getLevel(score: number) {
  if (score >= 100) return "Professional";
  if (score >= 80) return "Advanced";
  if (score >= 60) return "Intermediate";
  return "Beginner";
}

function getLevelDescription(level: string) {
  switch (level) {
    case "Professional":
      return "You demonstrated complete mastery of this assessment. You are ready to teach this skill at a professional level.";
    case "Advanced":
      return "You showed strong practical knowledge and a solid understanding of advanced concepts.";
    case "Intermediate":
      return "You understand the fundamentals and several practical concepts, but there is still room to strengthen your knowledge.";
    default:
      return "You are building your foundation. Keep learning and try the assessment again when you're more comfortable with the skill.";
  }
}

export default function QuizResultPage() {
  const searchParams = useSearchParams();

  const skill = searchParams.get("skill") || "Your skill";
  const score = Number(searchParams.get("score") || 0);
  const correct = Number(searchParams.get("correct") || 0);
  const total = Number(searchParams.get("total") || 5);
  const passed = searchParams.get("passed") === "true";
  const level = searchParams.get("level") || getLevel(score);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef0f8] text-zinc-950">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(139,92,246,0.35),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.28),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(217,70,239,0.20),transparent_35%)]" />
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[120px]" />
        <div className="absolute right-[-180px] top-[10%] h-[550px] w-[550px] rounded-full bg-blue-400/20 blur-[130px]" />
        <div className="absolute bottom-[-250px] left-[35%] h-[600px] w-[600px] rounded-full bg-fuchsia-400/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(70,65,110,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(70,65,110,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-2xl font-black">
            Skill<span className="text-violet-600">Swap</span>
          </Link>

          <Link
            href="/skills"
            className="flex items-center gap-2 rounded-xl border border-white bg-white/60 px-4 py-2 text-sm font-bold text-zinc-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            <Home size={16} />
            My Skills
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-4xl items-center px-6 py-14">
        <div className="w-full rounded-[32px] border border-white/90 bg-white/55 p-7 text-center shadow-2xl shadow-violet-200/30 backdrop-blur-2xl sm:p-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-violet-100 text-violet-600 shadow-sm">
            {passed ? <Award size={38} /> : <Sparkles size={38} />}
          </div>

          <p className="mt-6 text-xs font-black tracking-[0.2em] text-violet-600">
            SKILL VERIFICATION RESULT
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            {skill}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-zinc-500">
            {passed
              ? "You passed the SkillSwap verification quiz."
              : "You completed the SkillSwap verification quiz."}
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white bg-white/70 p-5 shadow-sm">
              <p className="text-4xl font-black text-violet-600">
                {score}%
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                Score
              </p>
            </div>

            <div className="rounded-2xl border border-white bg-white/70 p-5 shadow-sm">
              <p className="text-4xl font-black text-indigo-600">
                {correct}/{total}
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                Correct
              </p>
            </div>

            <div className="rounded-2xl border border-white bg-white/70 p-5 shadow-sm">
              <p className="text-2xl font-black text-zinc-950">
                {level}
              </p>
              <p className="mt-1 text-sm font-bold text-zinc-500">
                Skill level
              </p>
            </div>
          </div>

          <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-violet-100 bg-violet-50/70 p-6 text-left">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
                <Check size={22} />
              </div>

              <div>
                <h2 className="font-black">
                  {level} level
                </h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  {getLevelDescription(level)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white bg-white/60 p-5 text-left">
            <p className="text-sm font-black text-zinc-900">
              Skill level scale
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {[
                ["Beginner", "0–40%"],
                ["Intermediate", "60%"],
                ["Advanced", "80%"],
                ["Professional", "100%"],
              ].map(([name, range]) => (
                <div
                  key={name}
                  className={`rounded-xl px-3 py-3 text-center ${
                    name === level
                      ? "bg-violet-100 text-violet-700"
                      : "bg-zinc-50 text-zinc-500"
                  }`}
                >
                  <p className="text-xs font-black">{name}</p>
                  <p className="mt-1 text-[11px] font-semibold">
                    {range}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/skills"
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-300/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              Back to My Skills
              <ArrowRight size={17} />
            </Link>

            {!passed && (
              <Link
                href="/skills/verify"
                className="flex items-center justify-center gap-2 rounded-xl border border-white bg-white/70 px-6 py-3.5 font-bold text-zinc-700 shadow-sm transition hover:bg-white"
              >
                <RotateCcw size={17} />
                Try Again
              </Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}