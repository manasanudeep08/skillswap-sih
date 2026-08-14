"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

type RequestUser = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatar: string;
  skills: {
    id: number;
    name: string;
    type: string;
    verified: boolean;
  }[];
};

type ExchangeRequest = {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  sender?: RequestUser;
  receiver?: RequestUser;
};

const avatars: Record<string, string> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

export default function RequestsPage() {
  const [received, setReceived] = useState<
    ExchangeRequest[]
  >([]);

  const [sent, setSent] = useState<
    ExchangeRequest[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const meResponse = await fetch("/api/me");

      if (!meResponse.ok) {
        window.location.href = "/login";
        return;
      }

      const meData = await meResponse.json();

      if (!meData.user) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `/api/exchange-requests?userId=${meData.user.id}`
      );

      const data = await response.json();

      setReceived(data.received || []);
      setSent(data.sent || []);
    } catch (error) {
      console.error(
        "Failed to load requests:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateRequest(
    requestId: number,
    status: "accepted" | "rejected"
  ) {
    try {
      const meResponse = await fetch("/api/me");
      const meData = await meResponse.json();

      const response = await fetch(
        "/api/exchange-requests",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            userId: meData.user.id,
            status,
          }),
        }
      );

      if (response.ok) {
        loadRequests();
      }
    } catch (error) {
      console.error(
        "Failed to update request:",
        error
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
    <main className="min-h-screen bg-[#eef0f8] text-zinc-950">

      <nav className="border-b border-white/70 bg-white/60 backdrop-blur-xl">

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
            href="/matches"
            className="text-sm font-bold text-zinc-500 hover:text-violet-600"
          >
            Matches
          </Link>

        </div>

      </nav>

      <section className="mx-auto max-w-5xl px-6 py-12">

        <Link
          href="/"
          className="mb-7 flex w-fit items-center gap-2 text-sm font-bold text-zinc-500 hover:text-violet-600"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <h1 className="text-4xl font-black">
          Exchange Requests
        </h1>

        <p className="mt-3 text-zinc-500">
          Manage people who want to exchange skills
          with you.
        </p>

        {/* RECEIVED */}

        <section className="mt-10">

          <div className="flex items-center gap-2">

            <h2 className="text-xl font-black">
              Received
            </h2>

            {received.filter(
              (request) =>
                request.status === "pending"
            ).length > 0 && (
              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-600">
                {
                  received.filter(
                    (request) =>
                      request.status === "pending"
                  ).length
                }
              </span>
            )}

          </div>

          <div className="mt-5 space-y-4">

            {received.length === 0 ? (
              <EmptyState text="No exchange requests yet." />
            ) : (
              received.map((request) => (
                <ReceivedRequest
                  key={request.id}
                  request={request}
                  onUpdate={updateRequest}
                />
              ))
            )}

          </div>

        </section>

        {/* SENT */}

        <section className="mt-12">

          <h2 className="text-xl font-black">
            Sent Requests
          </h2>

          <div className="mt-5 space-y-4">

            {sent.length === 0 ? (
              <EmptyState text="You haven't sent any requests yet." />
            ) : (
              sent.map((request) => (
                <SentRequest
                  key={request.id}
                  request={request}
                />
              ))
            )}

          </div>

        </section>

      </section>

    </main>
  );
}


/* =========================================================
   RECEIVED REQUEST
   ========================================================= */

function ReceivedRequest({
  request,
  onUpdate,
}: {
  request: ExchangeRequest;
  onUpdate: (
    id: number,
    status: "accepted" | "rejected"
  ) => void;
}) {
  const user = request.sender;

  if (!user) return null;

  return (
    <div className="rounded-3xl border border-white bg-white/65 p-6 shadow-sm backdrop-blur-xl">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
            {avatars[user.avatar] || "🧑‍💻"}
          </div>

          <div>

            <h3 className="font-black">
              {user.name}
            </h3>

            <p className="text-sm text-zinc-400">
              @{user.username}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Wants to exchange skills with you.
            </p>

          </div>

        </div>

        {request.status === "pending" ? (
          <div className="flex gap-2">

            <button
              onClick={() =>
                onUpdate(
                  request.id,
                  "rejected"
                )
              }
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X size={16} />
              Decline
            </button>

            <button
              onClick={() =>
                onUpdate(
                  request.id,
                  "accepted"
                )
              }
              className="flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
            >
              <Check size={16} />
              Accept
            </button>

          </div>
        ) : (
          <RequestStatus status={request.status} />
        )}

      </div>

    </div>
  );
}


/* =========================================================
   SENT REQUEST
   ========================================================= */

function SentRequest({
  request,
}: {
  request: ExchangeRequest;
}) {
  const user = request.receiver;

  if (!user) return null;

  return (
    <div className="rounded-3xl border border-white bg-white/65 p-6 shadow-sm backdrop-blur-xl">

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-4">

          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
            {avatars[user.avatar] || "🧑‍💻"}
          </div>

          <div>

            <h3 className="font-black">
              {user.name}
            </h3>

            <p className="text-sm text-zinc-400">
              @{user.username}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Exchange request sent.
            </p>

          </div>

        </div>

        <RequestStatus status={request.status} />

      </div>

    </div>
  );
}


/* =========================================================
   STATUS
   ========================================================= */

function RequestStatus({
  status,
}: {
  status: string;
}) {
  if (status === "accepted") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600">
        <CheckCircle2 size={16} />
        Accepted
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-500">
        <X size={16} />
        Declined
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-600">
      <Clock size={16} />
      Pending
    </div>
  );
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/40 p-8 text-center text-sm font-medium text-zinc-400">
      {text}
    </div>
  );
}