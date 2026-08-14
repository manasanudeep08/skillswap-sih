"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  Plus,
  Trash2,
} from "lucide-react";

type Skill = {
  id: number;
  name: string;
  type: string;
  verified: boolean;
  verificationMethod: string | null;
  certificateUrl: string | null;
  quizScore: number | null;
};

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string;
};

export default function SkillsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [teachSkill, setTeachSkill] = useState("");
  const [learnSkill, setLearnSkill] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch("/api/me");

      if (!response.ok) {
        window.location.href = "/login";
        return;
      }

      const data = await response.json();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setUser(data.user);

      await loadSkills(data.user.id);
    } catch (error) {
      console.error("User loading error:", error);
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  async function loadSkills(userId: number) {
    try {
      const response = await fetch(`/api/skills?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Skills loading error:", error);
    }
  }

  async function addSkill(
    name: string,
    type: "teach" | "learn"
  ) {
    if (!user || !name.trim()) return;

    setAdding(true);

    try {
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name: name.trim(),
          type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to add skill.");
        return;
      }

      setSkills((current) => [data.skill, ...current]);

      if (type === "teach") {
        setTeachSkill("");
      } else {
        setLearnSkill("");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setAdding(false);
    }
  }

  async function deleteSkill(skillId: number) {
    if (!user) return;

    try {
      const response = await fetch("/api/skills", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        alert("Unable to remove skill.");
        return;
      }

      setSkills((current) =>
        current.filter((skill) => skill.id !== skillId)
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  }

  const teachingSkills = skills.filter(
    (skill) => skill.type === "teach"
  );

  const learningSkills = skills.filter(
    (skill) => skill.type === "learn"
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef0f8] text-zinc-950">

      {/* Background */}

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


      {/* Navbar */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/50 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill<span className="text-violet-600">Swap</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-white bg-white/60 px-4 py-2 text-sm font-bold text-zinc-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

        </div>

      </nav>


      {/* Main */}

      <section className="mx-auto max-w-5xl px-6 py-14">

        <div className="mb-10">

          <p className="text-sm font-black tracking-[0.2em] text-violet-600">
            YOUR SKILLS
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Build your skill profile.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-600">
            Tell SkillSwap what you can teach and what
            you want to learn. We'll use this to find
            people who complement your skills.
          </p>

        </div>


        {/* TEACH */}

        <section className="rounded-[28px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/20 backdrop-blur-2xl">

          <div className="flex items-start gap-4">

            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100/80 text-violet-600 shadow-inner">
              <Award size={23} />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                Skills you can teach
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Add skills you're confident enough to
                teach another person.
              </p>
            </div>

          </div>


          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

            <input
              value={teachSkill}
              onChange={(e) =>
                setTeachSkill(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addSkill(teachSkill, "teach");
                }
              }}
              placeholder="e.g. Video Editing"
              className="h-12 flex-1 rounded-xl border border-white bg-white/65 px-4 text-sm font-medium outline-none backdrop-blur-xl transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/40"
            />

            <button
              onClick={() =>
                addSkill(teachSkill, "teach")
              }
              disabled={adding}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 font-bold text-white shadow-lg shadow-violet-300/30 transition hover:-translate-y-0.5 hover:bg-violet-700 active:translate-y-0 disabled:opacity-50"
            >
              <Plus size={18} />
              Add Skill
            </button>

          </div>


          <div className="mt-6 flex flex-wrap gap-3">

            {teachingSkills.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No teaching skills added yet.
              </p>
            ) : (
              teachingSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDelete={() =>
                    deleteSkill(skill.id)
                  }
                />
              ))
            )}

          </div>

        </section>


        {/* LEARN */}

        <section className="mt-6 rounded-[28px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/20 backdrop-blur-2xl">

          <div className="flex items-start gap-4">

            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-100/80 text-indigo-600 shadow-inner">
              <BookOpen size={23} />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                Skills you want to learn
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                What would you like another person to
                teach you?
              </p>
            </div>

          </div>


          <div className="mt-7 flex flex-col gap-3 sm:flex-row">

            <input
              value={learnSkill}
              onChange={(e) =>
                setLearnSkill(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addSkill(learnSkill, "learn");
                }
              }}
              placeholder="e.g. Python"
              className="h-12 flex-1 rounded-xl border border-white bg-white/65 px-4 text-sm font-medium outline-none backdrop-blur-xl transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/40"
            />

            <button
              onClick={() =>
                addSkill(learnSkill, "learn")
              }
              disabled={adding}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-6 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-zinc-800 active:translate-y-0 disabled:opacity-50"
            >
              <Plus size={18} />
              Add Skill
            </button>

          </div>


          <div className="mt-6 flex flex-wrap gap-3">

            {learningSkills.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No learning goals added yet.
              </p>
            ) : (
              learningSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onDelete={() =>
                    deleteSkill(skill.id)
                  }
                />
              ))
            )}

          </div>

        </section>


        {/* VERIFY */}

        <div className="mt-8 overflow-hidden rounded-[28px] bg-violet-600 p-7 text-white shadow-xl shadow-violet-300/30">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-bold tracking-widest text-violet-200">
                NEXT STEP
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Verify the skills you teach.
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-violet-100">
                Have a certificate? Add it. Don't have
                one? Take a quick quiz to prove your
                knowledge.
              </p>

            </div>

            <Link
              href="/skills/verify"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-violet-700 transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              Verify Skills
              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


function SkillCard({
  skill,
  onDelete,
}: {
  skill: Skill;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-white bg-white/65 px-4 py-3 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-lg">

      <div className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-600">
        <Check size={16} />
      </div>

      <div>

        <p className="text-sm font-bold">
          {skill.name}
        </p>

        {skill.type === "teach" && (
          <p
            className={
              skill.verified
                ? "text-xs font-semibold text-green-600"
                : "text-xs text-zinc-400"
            }
          >
            {skill.verified
              ? "Verified"
              : "Not verified yet"}
          </p>
        )}

      </div>

      <button
        onClick={onDelete}
        className="ml-2 rounded-lg p-2 text-zinc-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        title="Remove skill"
      >
        <Trash2 size={15} />
      </button>

    </div>
  );
}