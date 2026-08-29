"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Plus,
  Trash2,
  Upload,
  X,
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

  const [certificateSkill, setCertificateSkill] =
    useState<Skill | null>(null);

  const [certificateLink, setCertificateLink] = useState("");
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateSaving, setCertificateSaving] = useState(false);

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

  function openCertificateModal(skill: Skill) {
    setCertificateSkill(skill);
    setCertificateLink("");
    setCertificateFile(null);
  }

  function closeCertificateModal() {
    if (certificateSaving) return;

    setCertificateSkill(null);
    setCertificateLink("");
    setCertificateFile(null);
  }

  function handleCertificateFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG, WEBP or PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please keep the certificate file under 2 MB.");
      event.target.value = "";
      return;
    }

    setCertificateFile(file);
    setCertificateLink("");
  }

  async function saveCertificate() {
    if (!user || !certificateSkill) return;

    if (!certificateLink.trim() && !certificateFile) {
      alert("Please add a certificate link or upload a certificate.");
      return;
    }

    setCertificateSaving(true);

    try {
      let certificateUrl = certificateLink.trim();

      if (certificateFile) {
        certificateUrl = await fileToDataUrl(certificateFile);
      }

      const response = await fetch("/api/skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: certificateSkill.id,
          userId: user.id,
          certificateUrl,
          verificationMethod: "certificate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to save certificate.");
        return;
      }

      setSkills((current) =>
        current.map((skill) =>
          skill.id === certificateSkill.id
            ? {
                ...skill,
                certificateUrl: data.skill.certificateUrl,
                verificationMethod:
                  data.skill.verificationMethod,
              }
            : skill
        )
      );

      closeCertificateModal();
    } catch (error) {
      console.error("Certificate save error:", error);
      alert("Unable to save certificate.");
    } finally {
      setCertificateSaving(false);
    }
  }

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Could not read file."));
        }
      };

      reader.onerror = () =>
        reject(new Error("Could not read file."));

      reader.readAsDataURL(file);
    });
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

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/45 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill<span className="text-violet-600">Swap</span>
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
              className="rounded-xl bg-white/70 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-white"
            >
              My Skills
            </Link>

            <Link
              href="/matches"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              Matches
            </Link>

            <Link
              href="/requests"
              className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
            >
              Requests
            </Link>

          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-2xl border border-white/90 bg-white/55 px-3 py-2 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
            >

              <Avatar avatar={user?.avatar || "avatar1"} />

              <div className="hidden text-left sm:block">

                <p className="text-sm font-black">
                  {user?.username}
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
              <span className="text-sm font-black">
                ↪
              </span>
            </button>

          </div>

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


          <div className="mt-6 space-y-3">

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
                  onCertificate={() =>
                    openCertificateModal(skill)
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


      {/* CERTIFICATE MODAL */}

      {certificateSkill && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-zinc-950/50 px-5 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-[28px] border border-white/80 bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-black tracking-widest text-violet-600">
                  SKILL VERIFICATION
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Add certificate
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {certificateSkill.name}
                </p>

              </div>

              <button
                onClick={closeCertificateModal}
                className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 text-zinc-500 transition hover:bg-zinc-200"
              >
                <X size={18} />
              </button>

            </div>


            <div className="mt-7 space-y-5">

              {/* LINK */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <LinkIcon size={16} />
                  Certificate link
                </label>

                <input
                  value={certificateLink}
                  onChange={(e) => {
                    setCertificateLink(e.target.value);
                    if (e.target.value) {
                      setCertificateFile(null);
                    }
                  }}
                  placeholder="https://example.com/my-certificate"
                  className="h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-200/40"
                />

              </div>


              <div className="flex items-center gap-3">

                <div className="h-px flex-1 bg-zinc-200" />

                <span className="text-xs font-bold text-zinc-400">
                  OR
                </span>

                <div className="h-px flex-1 bg-zinc-200" />

              </div>


              {/* FILE */}

              <div>

                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Upload size={16} />
                  Upload certificate
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center transition hover:border-violet-300 hover:bg-violet-50/50">

                  <FileText
                    size={28}
                    className="text-violet-500"
                  />

                  <p className="mt-3 text-sm font-bold">
                    {certificateFile
                      ? certificateFile.name
                      : "Choose certificate file"}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    JPG, PNG, WEBP or PDF • Max 2 MB
                  </p>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleCertificateFile}
                  />

                </label>

              </div>


              {/* INFO */}

              <div className="rounded-2xl bg-violet-50 p-4">

                <p className="text-xs leading-5 text-violet-700">
                  A certificate provides supporting evidence
                  for your skill. It will not automatically mark
                  the skill as verified. SkillSwap verification can
                  still be completed through the verification quiz.
                </p>

              </div>

            </div>


            <div className="mt-7 flex gap-3">

              <button
                onClick={closeCertificateModal}
                disabled={certificateSaving}
                className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={saveCertificate}
                disabled={certificateSaving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:opacity-50"
              >
                {certificateSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={17} />
                    Save Certificate
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


/* =========================================================
   SKILL CARD
   ========================================================= */

function SkillCard({
  skill,
  onDelete,
  onCertificate,
}: {
  skill: Skill;
  onDelete: () => void;
  onCertificate?: () => void;
}) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-white bg-white/65 px-4 py-4 shadow-sm backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-lg sm:flex-row sm:items-center">

      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600">
        <Check size={16} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-bold">
          {skill.name}
        </p>

        {skill.type === "teach" && (
          <div className="mt-1 flex flex-wrap items-center gap-2">

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

            {skill.certificateUrl && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[11px] font-bold text-green-600">
                <Award size={11} />
                Certificate added
              </span>
            )}

          </div>
        )}

      </div>


      {skill.type === "teach" && onCertificate && (
        <button
          onClick={onCertificate}
          className="flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
        >
          {skill.certificateUrl ? (
            <>
              <FileText size={14} />
              Edit Certificate
            </>
          ) : (
            <>
              <Upload size={14} />
              Add Certificate
            </>
          )}
        </button>
      )}


      {skill.certificateUrl && skill.type === "teach" && (
        <a
          href={skill.certificateUrl}
          target="_blank"
          rel="noreferrer"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-violet-600"
          title="View certificate"
        >
          <ExternalLink size={15} />
        </a>
      )}


      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-zinc-300 transition hover:bg-red-50 hover:text-red-500 sm:ml-1"
        title="Remove skill"
      >
        <Trash2 size={15} />
      </button>

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
        large
          ? "h-20 w-20 text-4xl"
          : "h-10 w-10 text-lg"
      } place-items-center rounded-full border border-white bg-white/70 shadow-inner backdrop-blur-xl`}
    >
      {avatars[avatar] || "🧑‍💻"}
    </div>
  );
}