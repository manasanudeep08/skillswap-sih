"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";

type Skill = {
  id: number;
  name: string;
  type: string;
  verified: boolean;
  verificationMethod:
    | string
    | null;
  certificateUrl:
    | string
    | null;
  quizScore: number | null;
  experienceLevel:
    | string
    | null;
};

type ProfileUser = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatar: string;

  email: string | null;
  phone: string | null;

  githubUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  portfolioUrl: string | null;
  otherUrl: string | null;

  privacy: {
    emailVisibility: string;
    phoneVisibility: string;
    socialVisibility: string;
  } | null;

  skills: Skill[];
};

type Relationship = {
  isOwner: boolean;
  isMatch: boolean;
  isAccepted: boolean;
};

type FormData = {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  phone: string;

  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  portfolioUrl: string;
  otherUrl: string;

  emailVisibility:
    | "private"
    | "matches"
    | "accepted";

  phoneVisibility:
    | "private"
    | "matches"
    | "accepted";

  socialVisibility:
    | "private"
    | "matches"
    | "accepted";
};

const avatars: Record<
  string,
  string
> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

const avatarOptions = [
  "avatar1",
  "avatar2",
  "avatar3",
  "avatar4",
  "avatar5",
];

export default function ProfilePage() {
  const [viewerId, setViewerId] =
    useState<number | null>(null);

  const [profile, setProfile] =
    useState<ProfileUser | null>(null);

  const [relationship, setRelationship] =
    useState<Relationship | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [form, setForm] =
    useState<FormData | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const meResponse =
        await fetch("/api/me");

      if (!meResponse.ok) {
        window.location.href =
          "/login";
        return;
      }

      const meData =
        await meResponse.json();

      if (!meData.user) {
        window.location.href =
          "/login";
        return;
      }

      const id = meData.user.id;

      setViewerId(id);

      const response =
        await fetch(
          `/api/profile?userId=${id}&viewerId=${id}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load profile."
        );
      }

      setProfile(data.user);
      setRelationship(
        data.relationship
      );

      setForm({
        name: data.user.name,
        username: data.user.username,
        bio: data.user.bio || "",
        avatar: data.user.avatar,
        phone: data.user.phone || "",

        githubUrl:
          data.user.githubUrl || "",

        linkedinUrl:
          data.user.linkedinUrl || "",

        instagramUrl:
          data.user.instagramUrl || "",

        portfolioUrl:
          data.user.portfolioUrl || "",

        otherUrl:
          data.user.otherUrl || "",

        emailVisibility:
          data.user.privacy
            ?.emailVisibility ||
          "accepted",

        phoneVisibility:
          data.user.privacy
            ?.phoneVisibility ||
          "accepted",

        socialVisibility:
          data.user.privacy
            ?.socialVisibility ||
          "matches",
      });
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateForm(
    field: keyof FormData,
    value: string
  ) {
    setForm(
      (current) =>
        current
          ? {
              ...current,
              [field]: value,
            }
          : current
    );
  }

  async function saveProfile() {
    if (!viewerId || !form) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId: viewerId,
            ...form,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save profile."
        );
      }

      setEditing(false);

      setSuccess(true);

      await loadProfile();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    if (!profile) {
      return;
    }

    setEditing(false);

    setForm({
      name: profile.name,
      username: profile.username,
      bio: profile.bio || "",
      avatar: profile.avatar,
      phone: profile.phone || "",

      githubUrl:
        profile.githubUrl || "",

      linkedinUrl:
        profile.linkedinUrl || "",

      instagramUrl:
        profile.instagramUrl || "",

      portfolioUrl:
        profile.portfolioUrl || "",

      otherUrl:
        profile.otherUrl || "",

      emailVisibility:
        profile.privacy
          ?.emailVisibility ||
        "accepted",

      phoneVisibility:
        profile.privacy
          ?.phoneVisibility ||
        "accepted",

      socialVisibility:
        profile.privacy
          ?.socialVisibility ||
        "matches",
    });

    setError("");
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8] px-6">
        <div className="text-center">
          <h1 className="text-2xl font-black">
            Profile unavailable
          </h1>

          <p className="mt-2 text-zinc-500">
            {error ||
              "We couldn't load this profile."}
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white"
          >
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  const teachingSkills =
    profile.skills.filter(
      (skill) =>
        skill.type === "teach"
    );

  const learningSkills =
    profile.skills.filter(
      (skill) =>
        skill.type === "learn"
    );

  const verifiedSkills =
    profile.skills.filter(
      (skill) =>
        skill.verified
    );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef0f8] text-zinc-950">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-violet-400/20 blur-[130px]" />

        <div className="absolute right-[-180px] top-20 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[130px]" />

        <div className="absolute bottom-[-250px] left-[30%] h-[600px] w-[600px] rounded-full bg-fuchsia-400/15 blur-[140px]" />

      </div>


      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/50 backdrop-blur-2xl">

        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

          <Link
            href="/"
            className="text-2xl font-black"
          >
            Skill
            <span className="text-violet-600">
              Swap
            </span>
          </Link>


          <div className="hidden items-center gap-2 md:flex">

            <NavLink
              href="/"
              label="Home"
            />

            <NavLink
              href="/skills"
              label="My Skills"
            />

            <NavLink
              href="/matches"
              label="Matches"
            />

            <NavLink
              href="/requests"
              label="Requests"
            />

          </div>


          <div className="flex items-center gap-2">

            <div className="grid h-10 w-10 place-items-center rounded-full border border-white bg-white/70 text-lg shadow-sm">
              {avatars[
                profile.avatar
              ] || "🧑‍💻"}
            </div>

          </div>

        </div>

      </nav>


      {/* MAIN */}

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 md:py-14">

        {/* TOP BAR */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-violet-600"
          >
            <ArrowLeft size={16} />
            Home
          </Link>

          {relationship?.isOwner && (
            <div className="flex gap-2">

              {editing ? (
                <>
                  <button
                    onClick={
                      cancelEditing
                    }
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl border border-white bg-white/70 px-4 py-2.5 text-sm font-bold text-zinc-600 shadow-sm"
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    onClick={
                      saveProfile
                    }
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() =>
                    setEditing(true)
                  }
                  className="flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}

            </div>
          )}

        </div>


        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-600">
            {error}
          </div>
        )}


        {/* =================================================
            PROFILE HERO
            ================================================= */}

        <section className="relative overflow-hidden rounded-[34px] border border-white/90 bg-white/55 p-7 shadow-[0_25px_80px_rgba(80,70,150,0.15)] backdrop-blur-2xl sm:p-9">

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="grid h-28 w-28 shrink-0 place-items-center rounded-[32px] border border-white bg-white/80 text-5xl shadow-xl">

                {avatars[
                  profile.avatar
                ] || "🧑‍💻"}

              </div>

              <div>

                <p className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-violet-600">
                  <Sparkles size={13} />
                  SKILLSWAP PROFILE
                </p>

                <h1 className="mt-2 text-4xl font-black tracking-tight">
                  {profile.name}
                </h1>

                <p className="mt-1 font-medium text-zinc-400">
                  @{profile.username}
                </p>

                <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">
                  {profile.bio ||
                    "No bio added yet."}
                </p>

              </div>

            </div>


            {/* STATS */}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">

              <ProfileStat
                value={
                  verifiedSkills.length
                }
                label="Verified"
              />

              <ProfileStat
                value={
                  teachingSkills.length
                }
                label="Teaching"
              />

              <ProfileStat
                value={
                  learningSkills.length
                }
                label="Learning"
              />

            </div>

          </div>

        </section>


        {/* =================================================
            EDIT MODE
            ================================================= */}

        {editing && form ? (
          <EditProfile
            form={form}
            updateForm={updateForm}
          />
        ) : (
          <>

            {/* =================================================
                VERIFIED SKILLS
                ================================================= */}

            <section className="mt-6 rounded-[30px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/10 backdrop-blur-2xl">

              <SectionHeading
                icon={
                  <ShieldCheck
                    size={22}
                  />
                }
                eyebrow="TRUSTED SKILLS"
                title="Verified expertise"
                description="Skills that this person has verified through a certificate or SkillSwap's quiz."
              />

              {verifiedSkills.length ===
              0 ? (
                <EmptyState text="No verified skills yet." />
              ) : (
                <div className="mt-7 grid gap-4 md:grid-cols-2">

                  {verifiedSkills.map(
                    (skill) => (
                      <VerifiedSkillCard
                        key={skill.id}
                        skill={skill}
                      />
                    )
                  )}

                </div>
              )}

            </section>


            {/* =================================================
                ALL SKILLS
                ================================================= */}

            <div className="mt-6 grid gap-6 lg:grid-cols-2">

              <SkillSection
                title="Can teach"
                eyebrow="TEACH"
                icon={
                  <Award size={21} />
                }
                skills={
                  teachingSkills
                }
              />

              <SkillSection
                title="Wants to learn"
                eyebrow="LEARN"
                icon={
                  <BookOpen
                    size={21}
                  />
                }
                skills={
                  learningSkills
                }
              />

            </div>


            {/* =================================================
                SOCIAL
                ================================================= */}

            {(profile.githubUrl ||
              profile.linkedinUrl ||
              profile.instagramUrl ||
              profile.portfolioUrl ||
              profile.otherUrl) && (

              <section className="mt-6 rounded-[30px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/10 backdrop-blur-2xl">

                <SectionHeading
                  icon={
                    <Globe
                      size={21}
                    />
                  }
                  eyebrow="AROUND THE WEB"
                  title="Social & links"
                  description="Other places where you can find this person."
                />

                <div className="mt-6 flex flex-wrap gap-3">

                  {profile.githubUrl && (
                    <SocialButton
                      href={
                        profile.githubUrl
                      }
                      icon={
                        <ExternalLink
                          size={18}
                        />
                      }
                      label="GitHub"
                    />
                  )}

                  {profile.linkedinUrl && (
                    <SocialButton
                      href={
                        profile.linkedinUrl
                      }
                      icon={
                        <ExternalLink
                          size={18}
                        />
                      }
                      label="LinkedIn"
                    />
                  )}

                  {profile.instagramUrl && (
                    <SocialButton
                      href={
                        profile.instagramUrl
                      }
                      icon={
                        <ExternalLink
                          size={18}
                        />
                      }
                      label="Instagram"
                    />
                  )}

                  {profile.portfolioUrl && (
                    <SocialButton
                      href={
                        profile.portfolioUrl
                      }
                      icon={
                        <Globe
                          size={18}
                        />
                      }
                      label="Portfolio"
                    />
                  )}

                  {profile.otherUrl && (
                    <SocialButton
                      href={
                        profile.otherUrl
                      }
                      icon={
                        <ExternalLink
                          size={18}
                        />
                      }
                      label="Other"
                    />
                  )}

                </div>

              </section>

            )}


            {/* =================================================
                CONTACT
                ================================================= */}

            {(profile.email ||
              profile.phone) && (

              <section className="mt-6 rounded-[30px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/10 backdrop-blur-2xl">

                <SectionHeading
                  icon={
                    <User size={21} />
                  }
                  eyebrow="CONTACT"
                  title="Contact information"
                  description="Information visible to you according to this person's privacy settings."
                />

                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  {profile.email && (
                    <ContactCard
                      icon={
                        <Mail
                          size={18}
                        />
                      }
                      label="Email"
                      value={
                        profile.email
                      }
                    />
                  )}

                  {profile.phone && (
                    <ContactCard
                      icon={
                        <Phone
                          size={18}
                        />
                      }
                      label="Phone"
                      value={
                        profile.phone
                      }
                    />
                  )}

                </div>

              </section>

            )}

          </>
        )}

      </section>


      {/* SUCCESS POPUP */}

      {success && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2">

          <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/85 px-5 py-4 shadow-2xl backdrop-blur-xl">

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2
                size={20}
              />
            </div>

            <div>

              <p className="text-sm font-black">
                Profile updated
              </p>

              <p className="text-xs text-zinc-500">
                Your SkillSwap profile is saved.
              </p>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


/* =========================================================
   EDIT PROFILE
   ========================================================= */

function EditProfile({
  form,
  updateForm,
}: {
  form: FormData;
  updateForm: (
    field: keyof FormData,
    value: string
  ) => void;
}) {
  return (
    <div className="mt-6 grid gap-6">

      {/* BASIC */}

      <EditSection
        title="Basic information"
        eyebrow="ABOUT YOU"
        icon={<User size={21} />}
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Input
            label="Name"
            value={form.name}
            onChange={(value) =>
              updateForm(
                "name",
                value
              )
            }
          />

          <Input
            label="Username"
            value={form.username}
            onChange={(value) =>
              updateForm(
                "username",
                value
              )
            }
          />

        </div>


        <div className="mt-5">

          <label className="text-sm font-black">
            Bio
          </label>

          <textarea
            value={form.bio}
            onChange={(event) =>
              updateForm(
                "bio",
                event.target.value
              )
            }
            maxLength={500}
            rows={4}
            placeholder="Tell people a little about yourself..."
            className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 bg-white/80 p-4 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />

        </div>


        <div className="mt-5">

          <label className="text-sm font-black">
            Avatar
          </label>

          <div className="mt-3 flex flex-wrap gap-3">

            {avatarOptions.map(
              (avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() =>
                    updateForm(
                      "avatar",
                      avatar
                    )
                  }
                  className={`grid h-14 w-14 place-items-center rounded-2xl border text-2xl transition ${
                    form.avatar ===
                    avatar
                      ? "border-violet-500 bg-violet-100 ring-4 ring-violet-100"
                      : "border-white bg-white hover:bg-violet-50"
                  }`}
                >
                  {avatars[
                    avatar
                  ]}
                </button>
              )
            )}

          </div>

        </div>

      </EditSection>


      {/* SOCIAL */}

      <EditSection
        title="Social & links"
        eyebrow="YOUR LINKS"
        icon={<Globe size={21} />}
      >

        <div className="grid gap-5 md:grid-cols-2">

          <Input
            label="GitHub"
            placeholder="https://github.com/username"
            value={form.githubUrl}
            onChange={(value) =>
              updateForm(
                "githubUrl",
                value
              )
            }
          />

          <Input
            label="LinkedIn"
            placeholder="https://linkedin.com/in/username"
            value={form.linkedinUrl}
            onChange={(value) =>
              updateForm(
                "linkedinUrl",
                value
              )
            }
          />

          <Input
            label="Instagram"
            placeholder="https://instagram.com/username"
            value={form.instagramUrl}
            onChange={(value) =>
              updateForm(
                "instagramUrl",
                value
              )
            }
          />

          <Input
            label="Portfolio / Website"
            placeholder="https://yourwebsite.com"
            value={form.portfolioUrl}
            onChange={(value) =>
              updateForm(
                "portfolioUrl",
                value
              )
            }
          />

          <Input
            label="Other link"
            placeholder="https://..."
            value={form.otherUrl}
            onChange={(value) =>
              updateForm(
                "otherUrl",
                value
              )
            }
          />

        </div>

      </EditSection>


      {/* CONTACT */}

      <EditSection
        title="Contact"
        eyebrow="PERSONAL INFORMATION"
        icon={<Phone size={21} />}
      >

        <Input
          label="Phone number"
          placeholder="+91 ..."
          value={form.phone}
          onChange={(value) =>
            updateForm(
              "phone",
              value
            )
          }
        />

        <p className="mt-4 text-xs leading-5 text-zinc-400">
          Your email comes from your account
          and cannot be changed here.
        </p>

      </EditSection>


      {/* PRIVACY */}

      <EditSection
        title="Privacy controls"
        eyebrow="YOU CONTROL THE ACCESS"
        icon={
          <ShieldCheck
            size={21}
          />
        }
      >

        <PrivacySelect
          label="Email"
          value={
            form.emailVisibility
          }
          onChange={(value) =>
            updateForm(
              "emailVisibility",
              value
            )
          }
        />

        <PrivacySelect
          label="Phone number"
          value={
            form.phoneVisibility
          }
          onChange={(value) =>
            updateForm(
              "phoneVisibility",
              value
            )
          }
        />

        <PrivacySelect
          label="Social links"
          value={
            form.socialVisibility
          }
          onChange={(value) =>
            updateForm(
              "socialVisibility",
              value
            )
          }
        />

      </EditSection>

    </div>
  );
}


/* =========================================================
   VERIFIED SKILL
   ========================================================= */

function VerifiedSkillCard({
  skill,
}: {
  skill: Skill;
}) {
  const certificate =
    skill.verificationMethod ===
    "certificate";

  const quiz =
    skill.verificationMethod ===
    "quiz";

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

      <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-violet-400/10 blur-2xl" />

      <div className="relative flex items-start gap-4">

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-300/30">

          {certificate ? (
            <Award size={23} />
          ) : (
            <ShieldCheck
              size={23}
            />
          )}

        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-black">
              {skill.name}
            </h3>

            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">
              VERIFIED
            </span>

          </div>


          {certificate ? (
            <div className="mt-3">

              <div className="flex items-center gap-2 text-sm font-black text-amber-700">

                <Award
                  size={15}
                />

                Certified

              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Verified through certificate
              </p>

              {skill.certificateUrl && (
                <a
                  href={
                    skill.certificateUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-violet-600 hover:text-violet-800"
                >
                  View certificate
                  <ExternalLink
                    size={12}
                  />
                </a>
              )}

            </div>
          ) : quiz ? (
            <div className="mt-3">

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                  Quiz Verified
                </span>

                {skill.experienceLevel && (
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                    {skill.experienceLevel}
                  </span>
                )}

              </div>

              <p className="mt-2 text-xs text-zinc-500">

                SkillSwap Quiz

                {skill.quizScore !==
                  null &&
                  ` • ${skill.quizScore}%`}

              </p>

            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              Skill verified by SkillSwap.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SKILL SECTION
   ========================================================= */

function SkillSection({
  title,
  eyebrow,
  icon,
  skills,
}: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  skills: Skill[];
}) {
  return (
    <section className="rounded-[30px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/10 backdrop-blur-2xl">

      <SectionHeading
        icon={icon}
        eyebrow={eyebrow}
        title={title}
        description=""
      />

      <div className="mt-6 space-y-3">

        {skills.length === 0 ? (
          <EmptyState text="Nothing added yet." />
        ) : (
          skills.map(
            (skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white bg-white/70 p-4"
              >

                <div>

                  <p className="font-black">
                    {skill.name}
                  </p>

                  {skill.verified ? (
                    <p className="mt-1 text-xs font-bold text-emerald-600">
                      Verified
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-400">
                      Not verified yet
                    </p>
                  )}

                </div>

                {skill.verified && (
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-500"
                  />
                )}

              </div>
            )
          )
        )}

      </div>

    </section>
  );
}


/* =========================================================
   SHARED UI
   ========================================================= */

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950"
    >
      {label}
    </Link>
  );
}

function ProfileStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="min-w-[80px] rounded-2xl border border-white bg-white/70 px-4 py-3 text-center shadow-sm">

      <p className="text-xl font-black text-violet-600">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-zinc-400">
        {label}
      </p>

    </div>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">

      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-600">
        {icon}
      </div>

      <div>

        <p className="text-xs font-black tracking-[0.16em] text-violet-600">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        )}

      </div>

    </div>
  );
}

function EditSection({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/90 bg-white/50 p-7 shadow-xl shadow-violet-200/10 backdrop-blur-2xl">

      <SectionHeading
        icon={icon}
        eyebrow={eyebrow}
        title={title}
        description=""
      />

      <div className="mt-7">
        {children}
      </div>

    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="text-sm font-black">
        {label}
      </label>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />

    </div>
  );
}

function PrivacySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value:
    | "private"
    | "matches"
    | "accepted";
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="mb-5 rounded-2xl border border-white bg-white/65 p-5 last:mb-0">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="font-black">
            {label}
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Choose who can see this information.
          </p>

        </div>

        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-violet-400"
        >
          <option value="private">
            Only me
          </option>

          <option value="matches">
            My matches
          </option>

          <option value="accepted">
            Accepted exchange partners
          </option>

        </select>

      </div>

    </div>
  );
}

function SocialButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-xl border border-white bg-white/75 px-4 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-violet-700 hover:shadow-lg"
    >
      {icon}
      {label}
      <ExternalLink
        size={13}
        className="text-zinc-400"
      />
    </a>
  );
}

function ContactCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/70 p-4">

      <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-600">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-black uppercase tracking-wide text-zinc-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-bold">
          {value}
        </p>

      </div>

    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white/40 p-6 text-center text-sm font-medium text-zinc-400">
      {text}
    </div>
  );
}