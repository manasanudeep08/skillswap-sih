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
  Link as LinkIcon,
  ShieldCheck,
  Sparkles,
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

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export default function VerifySkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSkill, setSelectedSkill] =
    useState<Skill | null>(null);

  const [verificationType, setVerificationType] = useState<
    "choose" | "certificate" | "quiz"
  >("choose");

  const [certificateValue, setCertificateValue] =
    useState("");

  const [certificateFileName, setCertificateFileName] =
    useState("");

  const [uploading, setUploading] = useState(false);

  const [quizQuestions, setQuizQuestions] =
    useState<QuizQuestion[]>([]);

  const [quizIndex, setQuizIndex] = useState(0);

  const [quizAnswers, setQuizAnswers] =
    useState<number[]>([]);

  const [quizScore, setQuizScore] = useState<number | null>(
    null
  );

  const [quizLoading, setQuizLoading] = useState(false);

  const [quizFinished, setQuizFinished] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    try {
      setLoading(true);

      const meResponse = await fetch("/api/me");

      if (!meResponse.ok) {
        window.location.href = "/login";
        return;
      }

      const meData = await meResponse.json();

      const userId = meData.user?.id;

      if (!userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `/api/skills?userId=${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load skills"
        );
      }

      setSkills(
        (data.skills || []).filter(
          (skill: Skill) => skill.type === "teach"
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to load your skills.");
    } finally {
      setLoading(false);
    }
  }

  function resetVerification() {
    setSelectedSkill(null);
    setVerificationType("choose");
    setCertificateValue("");
    setCertificateFileName("");
    setUploading(false);

    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizScore(null);
    setQuizFinished(false);
    setQuizLoading(false);
  }

  function selectSkill(skill: Skill) {
    setSelectedSkill(skill);
    setVerificationType("choose");
    setCertificateValue("");
    setCertificateFileName("");
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizScore(null);
    setQuizFinished(false);
    setError("");
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
      alert(
        "Please upload a JPG, PNG, WEBP or PDF certificate."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please keep the certificate under 2 MB.");

      event.target.value = "";
      return;
    }

    setCertificateFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCertificateValue(reader.result);
      }
    };

    reader.onerror = () => {
      alert("Unable to read the certificate file.");
      setCertificateFileName("");
      setCertificateValue("");
    };

    reader.readAsDataURL(file);
  }

  async function submitCertificate() {
    if (!selectedSkill) return;

    if (!certificateValue.trim()) {
      alert(
        "Please upload a certificate or add a certificate link."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");

      const meResponse = await fetch("/api/me");

      if (!meResponse.ok) {
        throw new Error("Unable to identify the current user.");
      }

      const meData = await meResponse.json();

      const userId = meData.user?.id;

      if (!userId) {
        throw new Error("User not found.");
      }

      const response = await fetch("/api/skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          userId,
          certificateUrl: certificateValue,
          verificationMethod: "certificate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save certificate."
        );
      }

      setSkills((current) =>
        current.map((skill) =>
          skill.id === selectedSkill.id
            ? data.skill
            : skill
        )
      );

      setSelectedSkill(data.skill);

      alert("Certificate added successfully.");

      setVerificationType("choose");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save certificate."
      );
    } finally {
      setUploading(false);
    }
  }

  async function startQuiz() {
    if (!selectedSkill) return;

    try {
      setQuizLoading(true);
      setError("");

      /*
       * The quiz API is expected to return:
       *
       * {
       *   questions: [
       *     {
       *       question: "...",
       *       options: ["...", "...", "...", "..."],
       *       answer: 0
       *     }
       *   ]
       * }
       *
       * If your existing quiz endpoint is different,
       * change only this URL.
       */

      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill: selectedSkill.name,
        }),
      });

      if (!response.ok) {
        /*
         * Fallback questions are used so the demo still
         * works if the AI quiz endpoint isn't available.
         */
        const fallback = createFallbackQuiz(
          selectedSkill.name
        );

        setQuizQuestions(fallback);
        setQuizIndex(0);
        setQuizAnswers([]);
        setQuizScore(null);
        setQuizFinished(false);
        setVerificationType("quiz");

        return;
      }

      const data = await response.json();

      if (
        !data.questions ||
        !Array.isArray(data.questions) ||
        data.questions.length === 0
      ) {
        const fallback = createFallbackQuiz(
          selectedSkill.name
        );

        setQuizQuestions(fallback);
      } else {
        setQuizQuestions(data.questions);
      }

      setQuizIndex(0);
      setQuizAnswers([]);
      setQuizScore(null);
      setQuizFinished(false);
      setVerificationType("quiz");
    } catch (err) {
      console.error(err);

      /*
       * Keep the jury demo usable even if the quiz API
       * isn't configured.
       */
      const fallback = createFallbackQuiz(
        selectedSkill.name
      );

      setQuizQuestions(fallback);
      setQuizIndex(0);
      setQuizAnswers([]);
      setQuizScore(null);
      setQuizFinished(false);
      setVerificationType("quiz");
    } finally {
      setQuizLoading(false);
    }
  }

  function answerQuestion(answer: number) {
    const updatedAnswers = [...quizAnswers];

    updatedAnswers[quizIndex] = answer;

    setQuizAnswers(updatedAnswers);
  }

  async function nextQuestion() {
    if (!quizQuestions.length) return;

    if (quizAnswers[quizIndex] === undefined) {
      alert("Please select an answer first.");
      return;
    }

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((current) => current + 1);
      return;
    }

    await finishQuiz();
  }

  async function finishQuiz() {
    if (!selectedSkill) return;

    let correct = 0;

    quizQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.answer) {
        correct++;
      }
    });

    const score = Math.round(
      (correct / quizQuestions.length) * 100
    );

    setQuizScore(score);
    setQuizFinished(true);

    try {
      const meResponse = await fetch("/api/me");

      if (!meResponse.ok) return;

      const meData = await meResponse.json();

      const userId = meData.user?.id;

      if (!userId) return;

      const passed = score >= 70;

      const response = await fetch("/api/skills", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skillId: selectedSkill.id,
          userId,
          verified: passed,
          verificationMethod: "quiz",
          quizScore: score,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setSelectedSkill(data.skill);

        setSkills((current) =>
          current.map((skill) =>
            skill.id === selectedSkill.id
              ? data.skill
              : skill
          )
        );
      }
    } catch (err) {
      console.error(
        "Failed to save quiz result:",
        err
      );
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

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
              className="rounded-xl bg-white/70 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm"
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

          <Link
            href="/skills"
            className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/60 px-4 py-2 text-sm font-bold text-zinc-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
          >
            <ArrowLeft size={16} />
            Back to Skills
          </Link>

        </div>

      </nav>


      {/* =====================================================
          CONTENT
          ===================================================== */}

      <section className="mx-auto max-w-5xl px-6 py-14">

        <div className="mb-10">

          <p className="text-sm font-black tracking-[0.2em] text-violet-600">
            SKILL VERIFICATION
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
            Prove what you know.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-7 text-zinc-600">
            Verify the skills you teach by providing
            supporting evidence or completing a quick
            knowledge quiz.
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}


        {/* =====================================================
            NO SKILLS
            ===================================================== */}

        {skills.length === 0 && (
          <div className="rounded-[28px] border border-white/90 bg-white/55 p-10 text-center shadow-xl backdrop-blur-2xl">

            <Award
              size={45}
              className="mx-auto text-violet-400"
            />

            <h2 className="mt-5 text-2xl font-black">
              No teaching skills yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Add a skill you can teach first. You can
              then verify it using a certificate or quiz.
            </p>

            <Link
              href="/skills"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
            >
              Add a Skill
              <ArrowRight size={16} />
            </Link>

          </div>
        )}


        {/* =====================================================
            SKILL SELECTION
            ===================================================== */}

        {!selectedSkill && skills.length > 0 && (

          <div className="space-y-4">

            {skills.map((skill) => (

              <button
                key={skill.id}
                onClick={() => selectSkill(skill)}
                className="group flex w-full items-center gap-5 rounded-[24px] border border-white/90 bg-white/55 p-6 text-left shadow-lg backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/75 hover:shadow-xl"
              >

                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                  <Award size={25} />
                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="text-lg font-black">
                    {skill.name}
                  </h2>

                  <div className="mt-1 flex flex-wrap gap-2">

                    {skill.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-600">
                        <Check size={12} />
                        Verified
                      </span>
                    )}

                    {skill.certificateUrl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-600">
                        <FileText size={12} />
                        Certificate
                      </span>
                    )}

                    {!skill.verified && !skill.certificateUrl && (
                      <span className="text-xs font-semibold text-zinc-400">
                        Verification required
                      </span>
                    )}

                  </div>

                </div>

                <ArrowRight
                  size={20}
                  className="shrink-0 text-zinc-300 transition group-hover:translate-x-1 group-hover:text-violet-600"
                />

              </button>

            ))}

          </div>

        )}


        {/* =====================================================
            SELECTED SKILL
            ===================================================== */}

        {selectedSkill && (
          <div>

            {/* HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <button
                onClick={resetVerification}
                className="flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-zinc-950"
              >
                <ArrowLeft size={16} />
                Choose another skill
              </button>

              <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-black shadow-sm">
                {selectedSkill.name}
              </div>

            </div>


            {/* =================================================
                CHOOSE VERIFICATION
                ================================================= */}

            {verificationType === "choose" && (

              <div className="grid gap-5 md:grid-cols-2">

                {/* CERTIFICATE */}

                <button
                  onClick={() =>
                    setVerificationType("certificate")
                  }
                  className="group rounded-[28px] border border-white/90 bg-white/55 p-7 text-left shadow-xl backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/75"
                >

                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                    <Award size={27} />
                  </div>

                  <h2 className="mt-6 text-2xl font-black">
                    I have a certificate
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Upload a certificate or provide a link
                    to one online.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-black text-violet-600">
                    Add certificate
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>

                </button>


                {/* QUIZ */}

                <button
                  onClick={startQuiz}
                  disabled={quizLoading}
                  className="group rounded-[28px] border border-white/90 bg-white/55 p-7 text-left shadow-xl backdrop-blur-2xl transition hover:-translate-y-1 hover:bg-white/75 disabled:cursor-wait disabled:opacity-70"
                >

                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600">
                    <BookOpen size={27} />
                  </div>

                  <h2 className="mt-6 text-2xl font-black">
                    Verify with a quiz
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    Answer a few questions to demonstrate
                    your knowledge of this skill.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm font-black text-indigo-600">
                    {quizLoading
                      ? "Preparing quiz..."
                      : "Start quiz"}

                    {!quizLoading && (
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    )}
                  </div>

                </button>

              </div>

            )}


            {/* =================================================
                CERTIFICATE
                ================================================= */}

            {verificationType === "certificate" && (

              <div className="rounded-[28px] border border-white/90 bg-white/55 p-7 shadow-xl backdrop-blur-2xl">

                <div className="flex items-start gap-4">

                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                    <Award size={24} />
                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      Add your certificate
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                      {selectedSkill.name}
                    </p>

                  </div>

                </div>


                {/* LINK */}

                <div className="mt-8">

                  <label className="flex items-center gap-2 text-sm font-black">
                    <LinkIcon size={16} />
                    Certificate link
                  </label>

                  <input
                    value={
                      certificateValue.startsWith("data:")
                        ? ""
                        : certificateValue
                    }
                    onChange={(event) => {
                      setCertificateValue(
                        event.target.value
                      );

                      setCertificateFileName("");
                    }}
                    placeholder="https://example.com/certificate"
                    className="mt-2 h-12 w-full rounded-xl border border-white bg-white/80 px-4 text-sm font-medium outline-none transition placeholder:text-zinc-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-200/40"
                  />

                </div>


                {/* DIVIDER */}

                <div className="my-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-zinc-200" />

                  <span className="text-xs font-black text-zinc-400">
                    OR
                  </span>

                  <div className="h-px flex-1 bg-zinc-200" />

                </div>


                {/* FILE */}

                <div>

                  <label className="flex items-center gap-2 text-sm font-black">
                    <Upload size={16} />
                    Upload certificate
                  </label>

                  <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-white/70 px-5 py-10 text-center transition hover:border-violet-400 hover:bg-violet-50/50">

                    <FileText
                      size={34}
                      className="text-violet-500"
                    />

                    <p className="mt-3 text-sm font-black">
                      {certificateFileName ||
                        "Choose certificate file"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      JPG, PNG, WEBP or PDF • Max 2 MB
                    </p>

                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={
                        handleCertificateFile
                      }
                    />

                  </label>

                </div>


                {/* SELECTED */}

                {certificateValue && (

                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">

                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-100 text-green-600">
                      <Check size={17} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-black text-green-700">
                        {certificateFileName
                          ? "Certificate selected"
                          : "Certificate link added"}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-green-600">
                        {certificateFileName ||
                          certificateValue}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCertificateValue("");
                        setCertificateFileName("");
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg text-green-500 transition hover:bg-green-100"
                    >
                      <X size={16} />
                    </button>

                  </div>

                )}


                {/* INFO */}

                <div className="mt-6 rounded-2xl bg-violet-50 p-4">

                  <div className="flex gap-3">

                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-violet-600"
                    />

                    <p className="text-xs leading-5 text-violet-700">
                      A certificate is supporting evidence
                      for your skill. It does not automatically
                      mark the skill as verified. SkillSwap can
                      verify your knowledge through the quiz.
                    </p>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    onClick={() => {
                      setVerificationType("choose");
                      setCertificateValue("");
                      setCertificateFileName("");
                    }}
                    disabled={uploading}
                    className="rounded-xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-white disabled:opacity-50"
                  >
                    Back
                  </button>

                  <button
                    onClick={submitCertificate}
                    disabled={
                      uploading ||
                      !certificateValue.trim()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading
                      ? "Saving..."
                      : "Save Certificate"}

                    {!uploading && (
                      <ArrowRight size={16} />
                    )}
                  </button>

                </div>

              </div>

            )}


            {/* =================================================
                QUIZ
                ================================================= */}

            {verificationType === "quiz" &&
              !quizFinished &&
              quizQuestions.length > 0 && (

                <div className="rounded-[28px] border border-white/90 bg-white/55 p-7 shadow-xl backdrop-blur-2xl">

                  {/* QUIZ HEADER */}

                  <div className="flex items-center justify-between gap-4">

                    <div>

                      <p className="text-xs font-black tracking-[0.2em] text-indigo-600">
                        KNOWLEDGE CHECK
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        {selectedSkill.name}
                      </h2>

                    </div>

                    <div className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-black text-indigo-600">
                      {quizIndex + 1} /{" "}
                      {quizQuestions.length}
                    </div>

                  </div>


                  {/* PROGRESS */}

                  <div className="mt-6 h-2 overflow-hidden rounded-full bg-zinc-200">

                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${
                          ((quizIndex + 1) /
                            quizQuestions.length) *
                          100
                        }%`,
                      }}
                    />

                  </div>


                  {/* QUESTION */}

                  <div className="mt-10">

                    <p className="text-xl font-black leading-8">
                      {quizQuestions[quizIndex].question}
                    </p>

                    <div className="mt-6 space-y-3">

                      {quizQuestions[
                        quizIndex
                      ].options.map(
                        (option, optionIndex) => {

                          const selected =
                            quizAnswers[
                              quizIndex
                            ] === optionIndex;

                          return (
                            <button
                              key={optionIndex}
                              onClick={() =>
                                answerQuestion(
                                  optionIndex
                                )
                              }
                              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                selected
                                  ? "border-indigo-400 bg-indigo-50 shadow-sm"
                                  : "border-white bg-white/65 hover:border-indigo-200 hover:bg-white"
                              }`}
                            >

                              <div
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${
                                  selected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-zinc-100 text-zinc-500"
                                }`}
                              >
                                {String.fromCharCode(
                                  65 + optionIndex
                                )}
                              </div>

                              <span className="text-sm font-semibold text-zinc-700">
                                {option}
                              </span>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>


                  {/* QUIZ ACTION */}

                  <div className="mt-8 flex justify-end">

                    <button
                      onClick={nextQuestion}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                    >
                      {quizIndex ===
                      quizQuestions.length - 1
                        ? "Finish Quiz"
                        : "Next Question"}

                      <ArrowRight size={16} />
                    </button>

                  </div>

                </div>

              )}


            {/* =================================================
                QUIZ RESULT
                ================================================= */}

            {verificationType === "quiz" &&
              quizFinished && (
                <div className="rounded-[28px] border border-white/90 bg-white/55 p-8 text-center shadow-xl backdrop-blur-2xl">

                  <div
                    className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${
                      (quizScore || 0) >= 70
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >

                    {(quizScore || 0) >= 70 ? (
                      <Check size={38} />
                    ) : (
                      <X size={38} />
                    )}

                  </div>


                  <p className="mt-6 text-xs font-black tracking-[0.2em] text-zinc-400">
                    QUIZ COMPLETE
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    {quizScore}%
                  </h2>


                  {(quizScore || 0) >= 70 ? (

                    <>
                      <h3 className="mt-3 text-xl font-black text-green-600">
                        Skill verified
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                        You passed the knowledge check for{" "}
                        <strong>
                          {selectedSkill.name}
                        </strong>
                        . This skill is now verified on
                        your SkillSwap profile.
                      </p>

                      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-bold text-green-600">
                        <ShieldCheck size={17} />
                        Verified by SkillSwap Quiz
                      </div>
                    </>

                  ) : (

                    <>
                      <h3 className="mt-3 text-xl font-black text-red-600">
                        Verification not completed
                      </h3>

                      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                        You need at least 70% to verify this
                        skill. You can try the quiz again.
                      </p>

                      <button
                        onClick={startQuiz}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                      >
                        Try Again
                        <ArrowRight size={16} />
                      </button>
                    </>

                  )}


                  <div className="mt-8">

                    <button
                      onClick={resetVerification}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-bold text-zinc-600 transition hover:bg-white"
                    >
                      <ArrowLeft size={16} />
                      Back to My Skills
                    </button>

                  </div>

                </div>
              )}

          </div>
        )}

      </section>

    </main>
  );
}


/* =========================================================
   FALLBACK QUIZ
   ========================================================= */

function createFallbackQuiz(
  skillName: string
): QuizQuestion[] {
  return [
    {
      question: `Which statement best describes a good understanding of ${skillName}?`,
      options: [
        "Being able to explain the basic concepts and apply them",
        "Only knowing the name of the skill",
        "Watching someone else do it",
        "Having no practical experience",
      ],
      answer: 0,
    },
    {
      question: `What is the best way to improve your ability in ${skillName}?`,
      options: [
        "Avoid practicing",
        "Practice and apply the skill to real problems",
        "Only memorize definitions",
        "Never ask questions",
      ],
      answer: 1,
    },
    {
      question: `If you are teaching ${skillName}, what should you do first?`,
      options: [
        "Assume the learner already knows everything",
        "Skip the basics",
        "Understand the learner's current level",
        "Give them the hardest task immediately",
      ],
      answer: 2,
    },
    {
      question: `Which approach is most useful when learning ${skillName}?`,
      options: [
        "Only reading about it",
        "Never trying it yourself",
        "Combining learning with practical use",
        "Avoiding feedback",
      ],
      answer: 2,
    },
    {
      question: `Why is verification useful for a SkillSwap teaching skill?`,
      options: [
        "It gives other students more confidence in the skill",
        "It removes the need to learn",
        "It guarantees everyone will like the teacher",
        "It makes practice unnecessary",
      ],
      answer: 0,
    },
  ];
}