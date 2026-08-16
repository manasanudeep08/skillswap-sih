"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Star,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  username: string;
  avatar: string;
};

type ExchangeRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  sender?: User;
  receiver?: User;
};

type Rating = {
  id: number;
  stars: number;
  comment: string | null;
  reviewer: User;
};

const avatars: Record<string, string> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

export default function RateExchangePage({
  params,
}: {
  params: Promise<{
    requestId: string;
  }>;
}) {
  const [requestId, setRequestId] =
    useState<number | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [exchange, setExchange] =
    useState<ExchangeRequest | null>(null);

  const [rating, setRating] =
    useState(0);

  const [hoveredRating, setHoveredRating] =
    useState(0);

  const [comment, setComment] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitted, setSubmitted] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      const resolvedParams =
        await params;

      const id =
        Number(resolvedParams.requestId);

      if (!Number.isInteger(id)) {
        setError(
          "Invalid exchange request."
        );
        setLoading(false);
        return;
      }

      setRequestId(id);

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

      setUser(meData.user);

      /*
       * Get the user's requests.
       */

      const requestsResponse =
        await fetch(
          `/api/exchange-requests?userId=${meData.user.id}`
        );

      const requestsData =
        await requestsResponse.json();

      const allRequests = [
        ...(requestsData.received || []),
        ...(requestsData.sent || []),
      ];

      const found =
        allRequests.find(
          (item: ExchangeRequest) =>
            item.id === id
        );

      if (!found) {
        setError(
          "Exchange request not found."
        );
        setLoading(false);
        return;
      }

      setExchange(found);

      /*
       * Check whether this user
       * already rated the exchange.
       */

      const ratingsResponse =
        await fetch(
          `/api/ratings?requestId=${id}`
        );

      if (ratingsResponse.ok) {
        const ratingsData =
          await ratingsResponse.json();

        const alreadyRated =
          (ratingsData.ratings || []).some(
            (item: Rating) =>
              item.reviewer.id ===
              meData.user.id
          );

        if (alreadyRated) {
          setSubmitted(true);
        }
      }
    } catch (error) {
      console.error(
        "Rating page error:",
        error
      );

      setError(
        "Unable to load this exchange."
      );
    } finally {
      setLoading(false);
    }
  }

  async function submitRating() {
    if (
      !user ||
      !requestId ||
      !rating
    ) {
      setError(
        "Please choose a star rating."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response =
        await fetch("/api/ratings", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            requestId,
            reviewerId: user.id,
            stars: rating,
            comment,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to submit rating."
        );
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Rating submit error:",
        error
      );

      setError(
        "Something went wrong while submitting your rating."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  if (!exchange || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8] px-6">

        <div className="text-center">

          <h1 className="text-2xl font-black">
            {error ||
              "Exchange not found."}
          </h1>

          <Link
            href="/requests"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to Requests
          </Link>

        </div>

      </main>
    );
  }

  const partner =
    exchange.senderId === user.id
      ? exchange.receiver
      : exchange.sender;

  if (!partner) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#eef0f8] text-zinc-950">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/45 backdrop-blur-2xl">

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
            href="/requests"
            className="text-sm font-bold text-zinc-500 transition hover:text-violet-600"
          >
            Requests
          </Link>

        </div>

      </nav>


      {/* CONTENT */}

      <section className="mx-auto max-w-2xl px-6 py-14">

        <Link
          href="/requests"
          className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-violet-600"
        >
          <ArrowLeft size={16} />
          Back to Requests
        </Link>


        {!submitted ? (
          <div className="rounded-[30px] border border-white bg-white/60 p-8 shadow-xl shadow-violet-200/20 backdrop-blur-2xl">

            <div className="text-center">

              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white bg-white text-4xl shadow-lg">
                {avatars[
                  partner.avatar
                ] || "🧑‍💻"}
              </div>

              <p className="mt-6 text-xs font-black tracking-[0.2em] text-violet-600">
                EXCHANGE COMPLETED
              </p>

              <h1 className="mt-3 text-3xl font-black">
                How was your exchange?
              </h1>

              <p className="mt-3 text-zinc-500">
                Rate your experience with{" "}
                <span className="font-bold text-zinc-800">
                  {partner.name}
                </span>
                .
              </p>

            </div>


            {/* STARS */}

            <div className="mt-10">

              <div className="flex justify-center gap-2">

                {[1, 2, 3, 4, 5].map(
                  (star) => {
                    const active =
                      star <=
                      (hoveredRating ||
                        rating);

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
                        onMouseEnter={() =>
                          setHoveredRating(
                            star
                          )
                        }
                        onMouseLeave={() =>
                          setHoveredRating(
                            0
                          )
                        }
                        className="rounded-xl p-2 transition hover:scale-110"
                        aria-label={`${star} stars`}
                      >
                        <Star
                          size={40}
                          fill={
                            active
                              ? "currentColor"
                              : "none"
                          }
                          className={
                            active
                              ? "text-amber-400"
                              : "text-zinc-300"
                          }
                        />
                      </button>
                    );
                  }
                )}

              </div>

              <p className="mt-3 text-center text-sm font-bold text-zinc-400">

                {rating === 1 &&
                  "Not a great exchange"}

                {rating === 2 &&
                  "Could have been better"}

                {rating === 3 &&
                  "It was okay"}

                {rating === 4 &&
                  "Great exchange"}

                {rating === 5 &&
                  "Excellent exchange"}

                {!rating &&
                  "Select a rating"}

              </p>

            </div>


            {/* COMMENT */}

            <div className="mt-9">

              <label className="text-sm font-black">
                Add a review
                <span className="ml-2 font-medium text-zinc-400">
                  Optional
                </span>
              </label>

              <textarea
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target.value
                  )
                }
                maxLength={500}
                rows={5}
                placeholder="Tell others what the exchange was like..."
                className="mt-3 w-full resize-none rounded-2xl border border-white bg-white/70 p-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />

              <p className="mt-2 text-right text-xs text-zinc-400">
                {comment.length}/500
              </p>

            </div>


            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
                {error}
              </div>
            )}


            {/* SUBMIT */}

            <button
              onClick={submitRating}
              disabled={
                submitting ||
                rating === 0
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 py-4 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Star size={17} />

              {submitting
                ? "Submitting..."
                : "Submit Rating"}
            </button>

          </div>
        ) : (
          <div className="rounded-[30px] border border-white bg-white/60 p-10 text-center shadow-xl shadow-violet-200/20 backdrop-blur-2xl">

            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={40} />
            </div>

            <h1 className="mt-7 text-3xl font-black">
              Rating submitted.
            </h1>

            <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-500">
              Thanks for helping build a more
              trustworthy SkillSwap community.
            </p>

            <Link
              href="/requests"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-violet-700"
            >
              Back to Requests
            </Link>

          </div>
        )}

      </section>

    </main>
  );
}