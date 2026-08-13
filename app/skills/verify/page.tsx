"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  FileText,
  ShieldCheck,
  Sparkles,
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

export default function VerifySkillsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const [showCertificate, setShowCertificate] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const [certificateName, setCertificateName] = useState("");
  const [uploading, setUploading] = useState(false);

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

  function chooseSkill(skill: Skill) {
    setSelectedSkill(skill);
    setShowCertificate(false);
    setShowQuiz(false);
    setCertificateName("");
  }

  function openCertificate() {
    setShowCertificate(true);
    setShowQuiz(false);
  }

  function openQuiz() {
    setShowQuiz(true);
    setShowCertificate(false);
  }

  async function submitCertificate() {
    if (!selectedSkill || !user || !certificateName.trim()) {
      return;
    }

    setUploading(true);

    try {
      /*
       * For the current demo version we store the certificate
       * name/reference in the database.
       *
       * Later we can connect this to real file storage such as
       * Supabase Storage, Cloudinary, or another service.
       */

      const response = await fetch("/api/skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          userId: user.id,
          verified: false,
          verificationMethod: "certificate",
          certificateUrl: certificateName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to submit certificate.");
        return;
      }

      setSkills((current) =>
        current.map((skill) =>
          skill.id === selectedSkill.id
            ? {
                ...skill,
                verified: false,
                verificationMethod: "certificate",
                certificateUrl: certificateName.trim(),
              }
            : skill
        )
      );

      setSelectedSkill(null);
      setShowCertificate(false);
      setCertificateName("");

      alert("Certificate submitted for verification.");
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  const teachingSkills = skills.filter(
    (skill) => skill.type === "teach"
  );

  const verifiedSkills = teachingSkills.filter(
    (skill) => skill.verified
  );

  const unverifiedSkills = teachingSkills.filter(
    (skill) => !skill.verified
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef0f8] text-zinc-950">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

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


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/50 backdrop-blur-2xl">

        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill<span className="text-violet-600">
              Swap
            </span>
          </Link>

          <Link
            href="/skills"
            className="flex items-center gap-2 rounded-xl border border-white bg-white/60 px-4 py-2 text-sm font-bold text-zinc-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/80"
          >
            <ArrowLeft size={16} />
            My Skills
          </Link>

        </div>

      </nav>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <section className="mx-auto max-w-5xl px-6 py-14">

        {/* HEADER */}

        <div className="mb-10">

          <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/90 bg-white/55 px-4 py-2 text-xs font-black tracking-widest text-violet-700 shadow-sm backdrop-blur-xl">

            <ShieldCheck size={15} />

            SKILL VERIFICATION

          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">
            Prove what you know.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-600">
            Verify the skills you can teach so other users
            know they're learning from someone who actually
            knows their stuff.
          </p>

        </div>


        {/* STATS */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <StatCard
            number={teachingSkills.length}
            label="Teaching skills"
          />

          <StatCard
            number={verifiedSkills.length}
            label="Verified"
          />

          <StatCard
            number={unverifiedSkills.length}
            label="Need verification"
          />

        </div>


        {/* NO SKILLS */}

        {teachingSkills.length === 0 ? (

          <div className="rounded-[28px] border border-white/90 bg-white/50 p-10 text-center shadow-xl shadow-violet-200/20 backdrop-blur-2xl">

            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-violet-600">
              <BookOpen size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No teaching skills yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Add at least one skill you can teach before
              you start verification.
            </p>

            <Link
              href="/skills"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-violet-300/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
            >
              Add Skills
              <ArrowRight size={17} />
            </Link>

          </div>

        ) : (

          <div className="space-y-4">

            {teachingSkills.map((skill) => (

              <SkillVerificationCard
                key={skill.id}
                skill={skill}
                onSelect={() => chooseSkill(skill)}
              />

            ))}

          </div>

        )}


        {/* =================================================
            SELECTED SKILL PANEL
        ================================================= */}

        {selectedSkill && (

          <div className="mt-8 rounded-[28px] border border-white/90 bg-white/55 p-7 shadow-2xl shadow-violet-200/30 backdrop-blur-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-black tracking-widest text-violet-600">
                  VERIFYING
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {selectedSkill.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Choose how you'd like to verify this skill.
                </p>

              </div>

              <button
                onClick={() => {
                  setSelectedSkill(null);
                  setShowCertificate(false);
                  setShowQuiz(false);
                }}
                className="rounded-xl px-3 py-2 text-sm font-bold text-zinc-400 transition hover:bg-white hover:text-zinc-700"
              >
                Close
              </button>

            </div>


            {/* CHOICE BUTTONS */}

            {!showCertificate && !showQuiz && (

              <div className="mt-7 grid gap-4 md:grid-cols-2">

                {/* CERTIFICATE */}

                <button
                  onClick={openCertificate}
                  className="group rounded-2xl border border-white bg-white/65 p-6 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-600 transition group-hover:scale-105">
                      <Award size={24} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
                    />

                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    I have a certificate
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Submit your certificate or credential
                    for verification.
                  </p>

                </button>


                {/* QUIZ */}

                <button
                  onClick={openQuiz}
                  className="group rounded-2xl border border-white bg-white/65 p-6 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-xl"
                >

                  <div className="flex items-center justify-between">

                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-600 transition group-hover:scale-105">
                      <Sparkles size={24} />
                    </div>

                    <ArrowRight
                      size={18}
                      className="text-zinc-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                    />

                  </div>

                  <h3 className="mt-5 text-lg font-black">
                    I don't have one
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Take a short SkillSwap quiz to prove
                    your knowledge.
                  </p>

                </button>

              </div>

            )}


            {/* CERTIFICATE */}

            {showCertificate && (

              <div className="mt-7 rounded-2xl border border-violet-100 bg-violet-50/60 p-6">

                <div className="flex items-start gap-4">

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <FileText size={21} />
                  </div>

                  <div>

                    <h3 className="font-black">
                      Submit your certificate
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      For now, enter the name of your certificate.
                      We'll connect real file uploads later.
                    </p>

                  </div>

                </div>


                <div className="mt-5">

                  <label className="text-sm font-bold">
                    Certificate name
                  </label>

                  <input
                    value={certificateName}
                    onChange={(e) =>
                      setCertificateName(e.target.value)
                    }
                    placeholder="e.g. Adobe Certified Professional"
                    className="mt-2 h-12 w-full rounded-xl border border-white bg-white/80 px-4 text-sm font-medium outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/40"
                  />

                </div>


                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    onClick={() => setShowCertificate(false)}
                    className="rounded-xl border border-white bg-white/70 px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-white"
                  >
                    Back
                  </button>

                  <button
                    onClick={submitCertificate}
                    disabled={
                      uploading ||
                      !certificateName.trim()
                    }
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/30 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Certificate
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                </div>

              </div>

            )}


            {/* QUIZ */}

            {showQuiz && (

              <Quiz
                skill={selectedSkill}
                user={user}
                onComplete={(updatedSkill) => {

                  setSkills((current) =>
                    current.map((skill) =>
                      skill.id === updatedSkill.id
                        ? updatedSkill
                        : skill
                    )
                  );

                  setSelectedSkill(null);
                  setShowQuiz(false);

                }}
                onBack={() => setShowQuiz(false)}
              />

            )}

          </div>

        )}

      </section>

    </main>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function StatCard({
  number,
  label,
}: {
  number: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/90 bg-white/50 p-5 shadow-sm backdrop-blur-xl">

      <p className="text-3xl font-black text-violet-600">
        {number}
      </p>

      <p className="mt-1 text-sm font-bold text-zinc-500">
        {label}
      </p>

    </div>
  );
}


/* =========================================================
   SKILL VERIFICATION CARD
   ========================================================= */

function SkillVerificationCard({
  skill,
  onSelect,
}: {
  skill: Skill;
  onSelect: () => void;
}) {
  return (
    <div className="group flex flex-col gap-5 rounded-[24px] border border-white/90 bg-white/55 p-6 shadow-sm backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-xl sm:flex-row sm:items-center">

      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600">

        {skill.verified ? (
          <Check size={23} />
        ) : (
          <Award size={23} />
        )}

      </div>


      <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <h3 className="font-black">
            {skill.name}
          </h3>

          {skill.verified && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
              Verified
            </span>
          )}

          {!skill.verified &&
            skill.verificationMethod === "certificate" && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                Pending review
              </span>
            )}

        </div>


        <p className="mt-1 text-sm text-zinc-500">

          {skill.verified
            ? skill.verificationMethod === "quiz"
              ? `Verified through SkillSwap Quiz${skill.quizScore !== null ? ` • ${skill.quizScore}%` : ""}`
              : "Verified through certificate"
            : skill.verificationMethod === "certificate"
              ? "Certificate submitted for verification"
              : "This skill still needs verification."}

        </p>

      </div>


      {!skill.verified && (

        <button
          onClick={onSelect}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/30 transition hover:-translate-y-0.5 hover:bg-violet-700"
        >

          Verify

          <ArrowRight size={16} />

        </button>

      )}

    </div>
  );
}


/* =========================================================
   QUIZ
   ========================================================= */

function Quiz({
  skill,
  user,
  onComplete,
  onBack,
}: {
  skill: Skill;
  user: User | null;
  onComplete: (skill: Skill) => void;
  onBack: () => void;
}) {
  const questions = getQuestions(skill.name);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[currentQuestion];

  function selectAnswer(answer: number) {
    setAnswers((current) => {
      const updated = [...current];

      updated[currentQuestion] = answer;

      return updated;
    });
  }

  async function nextQuestion() {
    if (answers[currentQuestion] === undefined) {
      alert("Choose an answer first.");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((current) => current + 1);
      return;
    }

    await finishQuiz();
  }

  async function finishQuiz() {
    if (!user) return;

    setSubmitting(true);

    const correctAnswers = questions.reduce(
      (score, question, index) => {
        return score +
          (answers[index] === question.answer ? 1 : 0);
      },
      0
    );

    const score = Math.round(
      (correctAnswers / questions.length) * 100
    );

    const passed = score >= 70;

    try {
      const response = await fetch("/api/skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: skill.id,
          userId: user.id,
          verified: passed,
          verificationMethod: "quiz",
          quizScore: score,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to save quiz result.");
        return;
      }

      if (passed) {
        alert(`Quiz passed! You scored ${score}%.`);
      } else {
        alert(
          `You scored ${score}%. You need 70% to verify this skill.`
        );
      }

      onComplete(data.skill);

    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving your result.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-7 rounded-2xl border border-white bg-white/70 p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-black tracking-widest text-indigo-600">
            SKILLSWAP QUIZ
          </p>

          <h3 className="mt-1 text-xl font-black">
            {skill.name}
          </h3>

        </div>

        <span className="text-sm font-bold text-zinc-400">
          {currentQuestion + 1}/{questions.length}
        </span>

      </div>


      {/* PROGRESS */}

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100">

        <div
          className="h-full rounded-full bg-violet-600 transition-all duration-300"
          style={{
            width: `${((currentQuestion + 1) / questions.length) * 100}%`,
          }}
        />

      </div>


      {/* QUESTION */}

      <div className="mt-7">

        <p className="text-lg font-black leading-7">
          {question.question}
        </p>


        <div className="mt-5 space-y-3">

          {question.options.map((option, index) => {

            const selected =
              answers[currentQuestion] === index;

            return (
              <button
                key={option}
                onClick={() => selectAnswer(index)}
                className={`w-full rounded-xl border p-4 text-left text-sm font-semibold transition ${
                  selected
                    ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm"
                    : "border-white bg-zinc-50/70 text-zinc-600 hover:bg-white hover:shadow-sm"
                }`}
              >
                <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm">
                  {String.fromCharCode(65 + index)}
                </span>

                {option}

              </button>
            );

          })}

        </div>

      </div>


      {/* BUTTONS */}

      <div className="mt-7 flex justify-between gap-3">

        <button
          onClick={onBack}
          disabled={submitting}
          className="rounded-xl border border-white bg-white px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          Back
        </button>


        <button
          onClick={nextQuestion}
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >

          {submitting
            ? "Saving..."
            : currentQuestion === questions.length - 1
              ? "Finish Quiz"
              : "Next"}

          {!submitting && <ArrowRight size={16} />}

        </button>

      </div>

    </div>
  );
}


/* =========================================================
   QUIZ QUESTIONS
   ========================================================= */

function getQuestions(skillName: string) {
  const skill = skillName.toLowerCase();

  if (skill.includes("python")) {
    return [
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "define"],
        answer: 1,
      },
      {
        question: "Which data type stores an ordered collection that can be changed?",
        options: ["Tuple", "String", "List", "Set"],
        answer: 2,
      },
      {
        question: "What does len() return?",
        options: [
          "The type of an object",
          "The number of items",
          "The memory address",
          "The last item",
        ],
        answer: 1,
      },
      {
        question: "Which symbol starts a comment in Python?",
        options: ["//", "#", "/*", "--"],
        answer: 1,
      },
      {
        question: "Which keyword is used to create a class?",
        options: ["object", "struct", "class", "new"],
        answer: 2,
      },
    ];
  }

  if (
    skill.includes("video") ||
    skill.includes("editing")
  ) {
    return [
      {
        question: "What does FPS usually stand for in video?",
        options: [
          "Frames Per Second",
          "File Processing System",
          "Frame Pixel Size",
          "Film Processing Speed",
        ],
        answer: 0,
      },
      {
        question: "What is a timeline mainly used for?",
        options: [
          "Writing code",
          "Arranging media over time",
          "Creating passwords",
          "Exporting images",
        ],
        answer: 1,
      },
      {
        question: "What does a video transition do?",
        options: [
          "Deletes a clip",
          "Changes the resolution",
          "Connects one shot to another",
          "Adds subtitles automatically",
        ],
        answer: 2,
      },
      {
        question: "What does rendering a video generally mean?",
        options: [
          "Processing the project into an output",
          "Deleting unused files",
          "Recording audio",
          "Renaming clips",
        ],
        answer: 0,
      },
      {
        question: "What is a keyframe commonly used for?",
        options: [
          "Changing a file name",
          "Defining a value at a point in time",
          "Deleting a timeline",
          "Compressing audio",
        ],
        answer: 1,
      },
    ];
  }

  return [
    {
      question: `Which is an important basic concept when learning ${skillName}?`,
      options: [
        "Understanding the fundamentals",
        "Skipping all practice",
        "Avoiding feedback",
        "Memorizing everything without understanding",
      ],
      answer: 0,
    },
    {
      question: "What is usually the best way to improve a practical skill?",
      options: [
        "Only watching tutorials",
        "Regular practice and feedback",
        "Never trying difficult tasks",
        "Avoiding mistakes completely",
      ],
      answer: 1,
    },
    {
      question: "Why are fundamentals important?",
      options: [
        "They provide a foundation for advanced work",
        "They make practice unnecessary",
        "They replace experience",
        "They only matter for exams",
      ],
      answer: 0,
    },
    {
      question: "What is a useful way to check your progress?",
      options: [
        "Never testing yourself",
        "Comparing only with professionals",
        "Building projects or solving problems",
        "Avoiding feedback",
      ],
      answer: 2,
    },
    {
      question: "What usually helps someone become better at a skill?",
      options: [
        "Consistent practice",
        "Doing it once",
        "Avoiding challenges",
        "Ignoring mistakes",
      ],
      answer: 0,
    },
  ];
}