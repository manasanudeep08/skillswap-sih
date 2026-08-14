"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Save,
  Sparkles,
  User,
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

type Skill = {
  id: number;
  name: string;
  type: string;
  verified: boolean;
  verificationMethod: string | null;
  certificateUrl: string | null;
  quizScore: number | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("avatar1");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
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

      const currentUser = data.user as UserData;

      setUser(currentUser);

      setName(currentUser.name);
      setUsername(currentUser.username);
      setBio(currentUser.bio || "");
      setAvatar(currentUser.avatar || "avatar1");

      try {
        const skillsResponse = await fetch(
          `/api/skills?userId=${currentUser.id}`
        );

        if (skillsResponse.ok) {
          const skillsData =
            await skillsResponse.json();

          setSkills(skillsData.skills || []);
        }
      } catch (skillError) {
        console.error(
          "Skills loading failed:",
          skillError
        );
      }

    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  function startEditing() {
    if (!user) return;

    setName(user.name);
    setUsername(user.username);
    setBio(user.bio || "");
    setAvatar(user.avatar || "avatar1");

    setError("");
    setEditing(true);
  }

  function cancelEditing() {
    if (!user) return;

    setName(user.name);
    setUsername(user.username);
    setBio(user.bio || "");
    setAvatar(user.avatar || "avatar1");

    setError("");
    setEditing(false);
  }

  async function saveProfile() {
    if (!user) return;

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            name: name.trim(),
            username: username.trim(),
            bio: bio.trim(),
            avatar,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update your profile."
        );
      }

      const updatedUser =
        data.user || {
          ...user,
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim() || null,
          avatar,
        };

      setUser(updatedUser);

      setName(updatedUser.name);
      setUsername(updatedUser.username);
      setBio(updatedUser.bio || "");
      setAvatar(updatedUser.avatar);

      setEditing(false);

    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const teachingSkills = skills.filter(
    (skill) => skill.type === "teach"
  );

  const learningSkills = skills.filter(
    (skill) => skill.type === "learn"
  );

  const verifiedSkills =
    teachingSkills.filter(
      (skill) => skill.verified
    );

  return (
    <main className="min-h-screen bg-[#eef0f8] text-zinc-950">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-[130px]" />

        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[130px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-400/15 blur-[130px]" />

      </div>

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/55 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill<span className="text-violet-600">
              Swap
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

        </div>

      </nav>

      {/* PAGE */}

      <section className="mx-auto max-w-5xl px-6 py-12">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-xs font-black tracking-[0.2em] text-violet-600">
            YOUR PROFILE
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            {editing
              ? "Edit your profile"
              : "Your profile"}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {editing
              ? "Keep your information up to date so people know who they are learning from."
              : "Show people what you know and what you want to learn."}
          </p>

        </div>

        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-[32px] border border-white/90 bg-white/55 shadow-[0_25px_80px_rgba(80,70,150,0.12)] backdrop-blur-2xl">

          {/* PROFILE TOP */}

          <div className="border-b border-white/80 px-7 py-8 sm:px-10">

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-5">

                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-white bg-white/80 text-5xl shadow-inner">
                  {avatars[
                    editing
                      ? avatar
                      : user.avatar
                  ] || "🧑‍💻"}
                </div>

                <div>

                  <h2 className="text-2xl font-black">
                    {editing
                      ? name || "Your Name"
                      : user.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    @
                    {editing
                      ? username || "username"
                      : user.username}
                  </p>

                  {!editing && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-600">

                      <CheckCircle2 size={15} />

                      {verifiedSkills.length} verified{" "}
                      {verifiedSkills.length === 1
                        ? "skill"
                        : "skills"}

                    </div>
                  )}

                </div>

              </div>

              {!editing && (
                <button
                  onClick={startEditing}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}

            </div>

          </div>

          {/* EDIT FORM */}

          {editing ? (
            <div className="px-7 py-8 sm:px-10">

              <div className="grid gap-6">

                {/* AVATAR */}

                <div>

                  <label className="text-sm font-black">
                    Choose an avatar
                  </label>

                  <div className="mt-3 flex flex-wrap gap-3">

                    {Object.entries(avatars).map(
                      ([key, emoji]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setAvatar(key)
                          }
                          className={`grid h-14 w-14 place-items-center rounded-2xl border text-2xl transition ${
                            avatar === key
                              ? "border-violet-500 bg-violet-50 shadow-sm"
                              : "border-white bg-white/70 hover:bg-white"
                          }`}
                        >
                          {emoji}
                        </button>
                      )
                    )}

                  </div>

                </div>

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="text-sm font-black"
                  >
                    Name
                  </label>

                  <input
                    id="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    placeholder="Your name"
                  />

                </div>

                {/* USERNAME */}

                <div>

                  <label
                    htmlFor="username"
                    className="text-sm font-black"
                  >
                    Username
                  </label>

                  <input
                    id="username"
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    placeholder="username"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="text-sm font-black"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    value={user.email}
                    disabled
                    className="mt-2 w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-100/70 px-4 py-3 text-sm text-zinc-500 outline-none"
                  />

                  <p className="mt-2 text-xs text-zinc-400">
                    Your email is linked to your account
                    and cannot be changed here.
                  </p>

                </div>

                {/* BIO */}

                <div>

                  <label
                    htmlFor="bio"
                    className="text-sm font-black"
                  >
                    Bio
                  </label>

                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(event) =>
                      setBio(event.target.value)
                    }
                    rows={4}
                    maxLength={250}
                    className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    placeholder="Tell people a little about yourself..."
                  />

                  <p className="mt-1 text-right text-xs text-zinc-400">
                    {bio.length}/250
                  </p>

                </div>

              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/20 transition hover:bg-violet-700 disabled:opacity-50"
                >

                  <Save size={16} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </div>
          ) : (
            <>
              {/* ABOUT */}

              <div className="border-b border-white/80 px-7 py-8 sm:px-10">

                <p className="text-xs font-black tracking-widest text-zinc-400">
                  ABOUT
                </p>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600">

                  {user.bio ||
                    "No bio added yet. Tell people a little about yourself and the skills you enjoy sharing."}

                </p>

              </div>

              {/* SKILLS */}

              <div className="px-7 py-8 sm:px-10">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs font-black tracking-widest text-zinc-400">
                      SKILLS
                    </p>

                    <h2 className="mt-1 text-2xl font-black">
                      What you know & want to learn
                    </h2>

                  </div>

                  <Link
                    href="/skills"
                    className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 sm:flex"
                  >
                    Manage Skills
                    <ArrowRight size={15} />
                  </Link>

                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">

                  {/* TEACHING */}

                  <SkillSection
                    title="I can teach"
                    icon={<Sparkles size={17} />}
                    skills={teachingSkills}
                    emptyText="No teaching skills added yet."
                  />

                  {/* LEARNING */}

                  <SkillSection
                    title="I want to learn"
                    icon={<GraduationCap size={17} />}
                    skills={learningSkills}
                    emptyText="No learning goals added yet."
                  />

                </div>

                <Link
                  href="/skills"
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50 sm:hidden"
                >
                  Manage Skills
                  <ArrowRight size={15} />
                </Link>

              </div>

            </>
          )}

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   SKILL SECTION
   ========================================================= */

function SkillSection({
  title,
  icon,
  skills,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  skills: Skill[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-white bg-white/55 p-5">

      <div className="flex items-center gap-3">

        <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600">
          {icon}
        </div>

        <h3 className="font-black">
          {title}
        </h3>

      </div>

      {skills.length === 0 ? (
        <p className="mt-5 text-sm text-zinc-400">
          {emptyText}
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">

          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-white px-3 py-2"
            >

              <span className="text-sm font-bold">
                {skill.name}
              </span>

              {skill.verified && (
                <span
                  title={
                    skill.quizScore
                      ? `Verified • ${skill.quizScore}%`
                      : "Verified"
                  }
                  className="text-emerald-600"
                >
                  <CheckCircle2 size={14} />
                </span>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}