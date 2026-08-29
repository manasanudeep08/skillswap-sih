"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Star,
  Trash2,
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
  skillId?: number | null;
  message?: string | null;
  status: string;
  createdAt: string;

  sender?: RequestUser;
  receiver?: RequestUser;

  skill?: {
    id: number;
    name: string;
    type: string;
    verified: boolean;
  } | null;
};

type CurrentUser = {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string;
};

const avatars: Record<string, string> = {
  avatar1: "🧑‍💻",
  avatar2: "🎨",
  avatar3: "🎮",
  avatar4: "📚",
  avatar5: "🚀",
};

export default function RequestsPage() {
  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [received, setReceived] =
    useState<ExchangeRequest[]>([]);

  const [sent, setSent] =
    useState<ExchangeRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [completing, setCompleting] =
    useState<number | null>(null);

  const [deleting, setDeleting] =
    useState<number | null>(null);

  /*
   * =====================================================
   * LOAD REQUESTS
   * =====================================================
   */

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
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

      setUser(meData.user);

      const response =
        await fetch(
          `/api/exchange-requests?userId=${meData.user.id}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          data.error ||
            "Failed to load requests"
        );

        return;
      }

      setReceived(
        data.received || []
      );

      setSent(
        data.sent || []
      );
    } catch (error) {
      console.error(
        "Failed to load requests:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================================
   * ACCEPT / REJECT REQUEST
   * =====================================================
   */

  async function updateRequest(
    requestId: number,
    status:
      | "accepted"
      | "rejected"
  ) {
    try {
      if (!user) return;

      const response =
        await fetch(
          "/api/exchange-requests",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              requestId,
              userId: user.id,
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to update request."
        );

        return;
      }

      await loadRequests();
    } catch (error) {
      console.error(
        "Failed to update request:",
        error
      );

      alert(
        "Something went wrong."
      );
    }
  }

  /*
   * =====================================================
   * COMPLETE EXCHANGE
   * =====================================================
   */

  async function completeExchange(
    requestId: number
  ) {
    if (!user) return;

    setCompleting(requestId);

    try {
      const response =
        await fetch(
          "/api/exchange-requests/complete",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              requestId,
              userId: user.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to complete exchange."
        );

        return;
      }

      await loadRequests();
    } catch (error) {
      console.error(
        "Complete exchange error:",
        error
      );

      alert(
        "Something went wrong."
      );
    } finally {
      setCompleting(null);
    }
  }

  /*
   * =====================================================
   * DELETE / DISMISS REQUEST
   * =====================================================
   */

  async function deleteRequest(
    requestId: number
  ) {
    if (!user) return;

    const confirmed =
      window.confirm(
        "Remove this request from your requests?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(requestId);

    try {
      const response =
        await fetch(
          "/api/exchange-requests",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              requestId,
              userId: user.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to delete request."
        );

        return;
      }

      /*
       * Remove immediately from the UI.
       */

      setReceived((current) =>
        current.filter(
          (item) =>
            item.id !== requestId
        )
      );

      setSent((current) =>
        current.filter(
          (item) =>
            item.id !== requestId
        )
      );
    } catch (error) {
      console.error(
        "Delete request error:",
        error
      );

      alert(
        "Something went wrong while deleting the request."
      );
    } finally {
      setDeleting(null);
    }
  }

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#eef0f8]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </main>
    );
  }

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-[#eef0f8] text-zinc-950">

      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/45 backdrop-blur-2xl">

        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">

          <Link
            href="/"
            className="shrink-0 text-2xl font-black"
          >
            Skill
            <span className="text-violet-600">
              Swap
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">

            <Link
              href="/"
              className="rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950 sm:px-4 sm:text-sm"
            >
              Home
            </Link>

            <Link
              href="/skills"
              className="rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950 sm:px-4 sm:text-sm"
            >
              My Skills
            </Link>

            <Link
              href="/matches"
              className="rounded-xl px-2.5 py-2 text-xs font-bold text-zinc-600 transition hover:bg-white/70 hover:text-zinc-950 sm:px-4 sm:text-sm"
            >
              Matches
            </Link>

            <Link
              href="/requests"
              className="rounded-xl bg-white/70 px-2.5 py-2 text-xs font-bold text-violet-700 shadow-sm sm:px-4 sm:text-sm"
            >
              Requests
            </Link>

          </div>

          <div className="flex shrink-0 items-center gap-2">

            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-2xl border border-white/90 bg-white/55 px-2 py-2 shadow-sm backdrop-blur-xl transition hover:bg-white/80 sm:gap-3 sm:px-3"
              >

                <div className="grid h-10 w-10 place-items-center rounded-full border border-white bg-white/70 text-lg shadow-inner">
                  {avatars[
                    user.avatar
                  ] || "🧑‍💻"}
                </div>

                <div className="hidden text-left sm:block">

                  <p className="text-sm font-black">
                    {user.username}
                  </p>

                  <p className="text-xs text-zinc-500">
                    View profile
                  </p>

                </div>

              </Link>
            )}

            <button
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/90 bg-white/55 text-zinc-500 shadow-sm transition hover:bg-red-50 hover:text-red-500"
              title="Logout"
            >
              ↪
            </button>

          </div>

        </div>

      </nav>


      {/* MAIN */}

      <section className="mx-auto max-w-5xl px-6 py-12">

        <h1 className="text-4xl font-black">
          Exchange Requests
        </h1>

        <p className="mt-3 text-zinc-500">
          Manage people who want to exchange
          skills with you.
        </p>


        {/* =================================================
            RECEIVED
            ================================================= */}

        <section className="mt-10">

          <div className="flex items-center gap-2">

            <h2 className="text-xl font-black">
              Received
            </h2>

            {received.filter(
              (request) =>
                request.status ===
                "pending"
            ).length > 0 && (

              <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-600">

                {
                  received.filter(
                    (request) =>
                      request.status ===
                      "pending"
                  ).length
                }

              </span>

            )}

          </div>


          <div className="mt-5 space-y-4">

            {received.length === 0 ? (

              <EmptyState
                text="No exchange requests yet."
              />

            ) : (

              received.map(
                (request) => (

                  <ReceivedRequest
                    key={request.id}
                    request={request}
                    onUpdate={
                      updateRequest
                    }
                    onComplete={
                      completeExchange
                    }
                    onDelete={
                      deleteRequest
                    }
                    completing={
                      completing ===
                      request.id
                    }
                    deleting={
                      deleting ===
                      request.id
                    }
                  />

                )
              )

            )}

          </div>

        </section>


        {/* =================================================
            SENT
            ================================================= */}

        <section className="mt-12">

          <h2 className="text-xl font-black">
            Sent Requests
          </h2>

          <div className="mt-5 space-y-4">

            {sent.length === 0 ? (

              <EmptyState
                text="You haven't sent any requests yet."
              />

            ) : (

              sent.map(
                (request) => (

                  <SentRequest
                    key={request.id}
                    request={request}
                    onComplete={
                      completeExchange
                    }
                    onDelete={
                      deleteRequest
                    }
                    completing={
                      completing ===
                      request.id
                    }
                    deleting={
                      deleting ===
                      request.id
                    }
                  />

                )
              )

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
  onComplete,
  onDelete,
  completing,
  deleting,
}: {
  request: ExchangeRequest;

  onUpdate: (
    id: number,
    status:
      | "accepted"
      | "rejected"
  ) => void;

  onComplete: (
    id: number
  ) => void;

  onDelete: (
    id: number
  ) => void;

  completing: boolean;

  deleting: boolean;
}) {
  const user =
    request.sender;

  if (!user) return null;

  return (
    <div className="rounded-3xl border border-white bg-white/65 p-6 shadow-sm backdrop-blur-xl">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
            {avatars[
              user.avatar
            ] || "🧑‍💻"}
          </div>

          <div>

            <h3 className="font-black">
              {user.name}
            </h3>

            <p className="text-sm text-zinc-400">
              @{user.username}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              Wants to exchange skills
              with you.
            </p>

            {request.skill && (
              <p className="mt-1 text-sm font-bold text-violet-600">
                Wants to learn:{" "}
                {request.skill.name}
              </p>
            )}

          </div>

        </div>


        {/* ACTIONS */}

        {request.status ===
        "pending" ? (

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

        ) : request.status ===
          "accepted" ? (

          <button
            onClick={() =>
              onComplete(
                request.id
              )
            }
            disabled={completing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2
              size={16}
            />

            {completing
              ? "Completing..."
              : "Mark Exchange Complete"}
          </button>

        ) : request.status ===
          "completed" ? (

          <div className="flex flex-wrap gap-2">

            <Link
              href={`/rate/${request.id}`}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-white transition hover:bg-amber-600"
            >
              <Star
                size={16}
                fill="currentColor"
              />
              Rate Exchange
            </Link>

            <button
              onClick={() =>
                onDelete(
                  request.id
                )
              }
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={16} />

              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>

        ) : request.status ===
          "rejected" ? (

          <button
            onClick={() =>
              onDelete(
                request.id
              )
            }
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={16} />

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        ) : (

          <RequestStatus
            status={
              request.status
            }
          />

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
  onComplete,
  onDelete,
  completing,
  deleting,
}: {
  request: ExchangeRequest;

  onComplete: (
    id: number
  ) => void;

  onDelete: (
    id: number
  ) => void;

  completing: boolean;

  deleting: boolean;
}) {
  const user =
    request.receiver;

  if (!user) return null;

  return (
    <div className="rounded-3xl border border-white bg-white/65 p-6 shadow-sm backdrop-blur-xl">

      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-4">

          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">
            {avatars[
              user.avatar
            ] || "🧑‍💻"}
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

            {request.skill && (
              <p className="mt-1 text-sm font-bold text-violet-600">
                Learning:{" "}
                {request.skill.name}
              </p>
            )}

          </div>

        </div>


        {/* ACTIONS */}

        {request.status ===
        "accepted" ? (

          <button
            onClick={() =>
              onComplete(
                request.id
              )
            }
            disabled={completing}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <CheckCircle2
              size={16}
            />

            {completing
              ? "Completing..."
              : "Mark Exchange Complete"}
          </button>

        ) : request.status ===
          "completed" ? (

          <div className="flex flex-wrap gap-2">

            <Link
              href={`/rate/${request.id}`}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-black text-white transition hover:bg-amber-600"
            >
              <Star
                size={16}
                fill="currentColor"
              />
              Rate Exchange
            </Link>

            <button
              onClick={() =>
                onDelete(
                  request.id
                )
              }
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              <Trash2 size={16} />

              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>

          </div>

        ) : request.status ===
          "rejected" ? (

          <button
            onClick={() =>
              onDelete(
                request.id
              )
            }
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={16} />

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>

        ) : (

          <RequestStatus
            status={
              request.status
            }
          />

        )}

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
  if (
    status === "accepted"
  ) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-600">
        <CheckCircle2 size={16} />
        Accepted
      </div>
    );
  }

  if (
    status === "completed"
  ) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-black text-violet-600">
        <CheckCircle2 size={16} />
        Completed
      </div>
    );
  }

  if (
    status === "rejected"
  ) {
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