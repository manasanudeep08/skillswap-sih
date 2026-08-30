"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const avatars = [
  { id: "avatar1", emoji: "🧑‍💻" },
  { id: "avatar2", emoji: "🎨" },
  { id: "avatar3", emoji: "🎮" },
  { id: "avatar4", emoji: "📚" },
  { id: "avatar5", emoji: "🚀" },
];

declare global {
  interface Window {
    initSendOTP?: (configuration: {
      widgetId: string;
      tokenAuth: string;
      identifier?: string;
      exposeMethods: boolean;
      success?: (data: any) => void;
      failure?: (error: any) => void;
    }) => void;

    sendOtp?: (
      identifier: string,
      success?: (data: any) => void,
      failure?: (error: any) => void
    ) => void;

    verifyOtp?: (
      otp: string | number,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      reqId?: string
    ) => void;

    retryOtp?: (
      channel: string | null,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      reqId?: string
    ) => void;
  }
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("avatar1");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [reqId, setReqId] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg91Ready, setMsg91Ready] = useState(false);

  /*
   * ============================================================
   * LOAD MSG91
   * ============================================================
   */

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-msg91-otp="true"]'
    );

    if (existingScript) {
      if (typeof window.initSendOTP === "function") {
        initializeMSG91();
      }

      return;
    }

    const script = document.createElement("script");

    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;
    script.setAttribute("data-msg91-otp", "true");

    script.onload = () => {
      initializeMSG91();
    };

    script.onerror = () => {
      console.error("MSG91: Unable to load OTP script.");
      setMsg91Ready(false);
    };

    document.head.appendChild(script);

    return () => {
      // Do not remove the MSG91 script.
      // Removing it can break the widget when React remounts.
    };
  }, []);

  function initializeMSG91() {
    const widgetId = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID;
    const widgetToken = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN;

    if (!widgetId) {
      console.error("MSG91: NEXT_PUBLIC_MSG91_WIDGET_ID is missing.");
      return;
    }

    if (!widgetToken) {
      console.error("MSG91: NEXT_PUBLIC_MSG91_WIDGET_TOKEN is missing.");
      return;
    }

    if (typeof window.initSendOTP !== "function") {
      console.error("MSG91: initSendOTP is not available.");
      return;
    }

    try {
      window.initSendOTP({
        widgetId,
        tokenAuth: widgetToken,
        exposeMethods: true,

        /*
         * We intentionally don't handle verification here.
         *
         * We handle sendOtp / verifyOtp ourselves below.
         * This avoids duplicate success/failure callbacks.
         */
        success: (data) => {
          console.log("MSG91 widget success:", data);
        },

        failure: (error) => {
          console.error("MSG91 widget failure:", error);
        },
      });

      setMsg91Ready(true);

      console.log("MSG91: widget initialized successfully.");
    } catch (error) {
      console.error("MSG91: widget initialization failed:", error);
      setMsg91Ready(false);
    }
  }

  /*
   * ============================================================
   * EXTRACT REQUEST ID
   * ============================================================
   *
   * MSG91 can return:
   *
   * {
   *   message: "366844616354373332393833",
   *   type: "success"
   * }
   *
   * IMPORTANT:
   *
   * "success" is NOT the request ID.
   * "message" is the request ID in this response.
   */

  function extractReqId(value: any): string {
    if (value == null) {
      return "";
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return "";
      }

      /*
       * Sometimes the SDK may return JSON as a string.
       */
      try {
        const parsed = JSON.parse(trimmed);
        return extractReqId(parsed);
      } catch {
        /*
         * A plain string can itself be a request ID.
         */
        if (
          trimmed.toLowerCase() !== "success" &&
          trimmed.toLowerCase() !== "ok"
        ) {
          return trimmed;
        }

        return "";
      }
    }

    if (typeof value !== "object") {
      return "";
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = extractReqId(item);

        if (found) {
          return found;
        }
      }

      return "";
    }

    /*
     * Check the most likely request ID fields first.
     */
    const directKeys = [
      "reqId",
      "reqID",
      "requestId",
      "requestID",
      "message",
    ];

    for (const key of directKeys) {
      const candidate = value[key];

      if (
        candidate !== null &&
        candidate !== undefined &&
        typeof candidate === "string"
      ) {
        const result = candidate.trim();

        if (
          result &&
          result.toLowerCase() !== "success" &&
          result.toLowerCase() !== "ok"
        ) {
          return result;
        }
      }
    }

    /*
     * Search nested objects.
     */
    for (const key of Object.keys(value)) {
      const found = extractReqId(value[key]);

      if (found) {
        return found;
      }
    }

    return "";
  }

  /*
   * ============================================================
   * EXTRACT ACCESS TOKEN
   * ============================================================
   *
   * MSG91 Verify OTP returns a JWT access token.
   *
   * Depending on the SDK version/response it may appear as:
   *
   * accessToken
   * access_token
   * access-token
   * token
   * message
   *
   * It can also potentially be returned directly as a string.
   */

  function extractAccessToken(value: any): string {
    if (value == null) {
      return "";
    }

    /*
     * If the SDK gives us the JWT directly as a string,
     * accept it.
     */
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return "";
      }

      /*
       * If it looks like JSON, inspect the JSON.
       */
      try {
        const parsed = JSON.parse(trimmed);

        return extractAccessToken(parsed);
      } catch {
        /*
         * Otherwise treat the string as the token itself.
         *
         * JWTs normally look like:
         * eyJxxxxx.yyyyy.zzzzz
         */
        if (trimmed.split(".").length === 3) {
          return trimmed;
        }

        return "";
      }
    }

    if (typeof value !== "object") {
      return "";
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = extractAccessToken(item);

        if (found) {
          return found;
        }
      }

      return "";
    }

    /*
     * Check explicit token fields first.
     */
    const tokenKeys = [
      "accessToken",
      "access_token",
      "access-token",
      "token",
    ];

    for (const key of tokenKeys) {
      const candidate = value[key];

      if (typeof candidate === "string") {
        const trimmed = candidate.trim();

        if (
          trimmed &&
          trimmed.toLowerCase() !== "success" &&
          trimmed.toLowerCase() !== "ok"
        ) {
          /*
           * Prefer JWT-looking values.
           */
          if (trimmed.split(".").length === 3) {
            return trimmed;
          }

          /*
           * Also accept non-JWT token strings in case
           * MSG91 changes its token format.
           */
          return trimmed;
        }
      }
    }

    /*
     * MSG91 may return the token in "message".
     */
    if (typeof value.message === "string") {
      const message = value.message.trim();

      if (
        message &&
        message.toLowerCase() !== "success" &&
        message.toLowerCase() !== "ok"
      ) {
        /*
         * If it is a JWT, definitely use it.
         */
        if (message.split(".").length === 3) {
          return message;
        }
      }
    }

    /*
     * Search nested objects.
     */
    for (const key of Object.keys(value)) {
      const found = extractAccessToken(value[key]);

      if (found) {
        return found;
      }
    }

    return "";
  }

  /*
   * ============================================================
   * CREATE ACCOUNT
   * ============================================================
   */

  async function createAccount(accessToken: string) {
    setLoading(true);

    try {
      console.log("Sending MSG91 access token to server.");

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          bio,
          avatar,
          phone: `+91${phone}`,
          msg91AccessToken: accessToken,
        }),
      });

      const data = await response.json();

      console.log("REGISTER API RESPONSE:", data);

      if (!response.ok) {
        alert(
          data?.error ||
            "Something went wrong while creating your account."
        );

        return;
      }

      setVerified(true);

      alert("Account created successfully!");

      window.location.href = "/";
    } catch (error) {
      console.error("Account creation error:", error);

      alert("Unable to connect to the server.");
    } finally {
      setLoading(false);
      setOtpLoading(false);
    }
  }

  /*
   * ============================================================
   * SEND OTP
   * ============================================================
   */

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (otpSent) {
      return;
    }

    if (!msg91Ready || typeof window.sendOtp !== "function") {
      alert(
        "OTP service is still loading. Please wait a moment and try again."
      );

      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      alert("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setOtpLoading(true);
    setReqId("");

    console.log("MSG91: sending OTP to", `91${cleanPhone}`);

    window.sendOtp(
      `91${cleanPhone}`,

      /*
       * SUCCESS
       */
      (data) => {
        console.log("MSG91 SEND OTP RESPONSE:", data);

        const newReqId = extractReqId(data);

        console.log("MSG91 REQUEST ID:", newReqId);

        if (!newReqId) {
          console.error(
            "MSG91 returned no usable request ID:",
            data
          );

          setOtpLoading(false);
          setOtpSent(false);

          alert(
            "MSG91 sent the OTP but did not return a valid request ID. Please try again."
          );

          return;
        }

        setReqId(newReqId);
        setOtpSent(true);
        setOtp("");
        setOtpLoading(false);
      },

      /*
       * FAILURE
       */
      (error) => {
        console.error("MSG91 SEND OTP ERROR:", error);

        setOtpLoading(false);

        const errorMessage =
          error?.message ||
          error?.error ||
          "Could not send OTP. Please check your phone number and try again.";

        alert(errorMessage);
      }
    );
  }

  /*
   * ============================================================
   * VERIFY OTP
   * ============================================================
   */

  function handleVerifyOtp() {
    if (typeof window.verifyOtp !== "function") {
      alert("OTP service is still loading. Please try again.");

      return;
    }

    if (!otp || otp.length < 4) {
      alert("Enter the OTP you received.");

      return;
    }

    if (!reqId) {
      alert(
        "The OTP request ID is missing. Please send the OTP again."
      );

      return;
    }

    if (otpLoading) {
      return;
    }

    setOtpLoading(true);

    console.log("MSG91 VERIFY OTP:", {
      reqId,
      otpLength: otp.length,
    });

    window.verifyOtp(
      otp,

      /*
       * SUCCESS
       */
      async (data) => {
        console.log("MSG91 VERIFY OTP RESPONSE:", data);

        const accessToken = extractAccessToken(data);

        /*
         * VERY IMPORTANT DEBUGGING LOG.
         *
         * We don't print the actual token for security.
         */
        console.log("MSG91 ACCESS TOKEN RECEIVED:", {
          received: Boolean(accessToken),
          length: accessToken.length,
          looksLikeJWT: accessToken.split(".").length === 3,
        });

        if (!accessToken) {
          console.error(
            "MSG91 returned no usable access token. Full response:",
            data
          );

          setOtpLoading(false);

          alert(
            "OTP was verified, but MSG91 did not return an access token. Please try again."
          );

          return;
        }

        await createAccount(accessToken);
      },

      /*
       * FAILURE
       */
      (error) => {
        console.error("MSG91 VERIFY OTP ERROR:", error);

        setOtpLoading(false);

        const errorMessage =
          error?.message ||
          error?.error ||
          "Invalid or expired OTP. Please try again.";

        alert(errorMessage);
      },

      reqId
    );
  }

  /*
   * ============================================================
   * RESEND OTP
   * ============================================================
   */

  function handleResendOtp() {
    if (typeof window.retryOtp !== "function") {
      alert("OTP service is still loading.");

      return;
    }

    if (!reqId) {
      alert("No OTP request found. Please send the OTP again.");

      return;
    }

    if (otpLoading) {
      return;
    }

    setOtpLoading(true);

    console.log("MSG91 RESEND OTP:", {
      reqId,
      channel: "11",
    });

    window.retryOtp(
      "11",

      /*
       * SUCCESS
       */
      (data) => {
        console.log("MSG91 RESEND OTP RESPONSE:", data);

        const newReqId = extractReqId(data);

        if (newReqId) {
          setReqId(newReqId);

          console.log(
            "MSG91 NEW REQUEST ID:",
            newReqId
          );
        } else {
          console.warn(
            "MSG91 resend did not return a new request ID. Keeping old request ID."
          );
        }

        setOtp("");
        setOtpLoading(false);

        alert("A new OTP has been sent.");
      },

      /*
       * FAILURE
       */
      (error) => {
        console.error("MSG91 RESEND OTP ERROR:", error);

        setOtpLoading(false);

        const errorMessage =
          error?.message ||
          error?.error ||
          "Unable to resend OTP. Please try again.";

        alert(errorMessage);
      },

      reqId
    );
  }

  /*
   * ============================================================
   * CHANGE PHONE
   * ============================================================
   */

  function changePhoneNumber() {
    if (otpLoading) {
      return;
    }

    setOtpSent(false);
    setOtp("");
    setReqId("");
    setVerified(false);
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-[#f7f7fb] text-zinc-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 block text-center text-3xl font-black tracking-tight text-zinc-950"
          >
            Skill<span className="text-violet-600">Swap</span>
          </Link>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-8 shadow-[0_20px_70px_rgba(30,20,60,0.08)] sm:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold tracking-wide text-violet-700">
                JOIN SKILLSWAP
              </div>

              <h1 className="text-3xl font-black tracking-tight text-zinc-950">
                Create your account
              </h1>

              <p className="mt-3 text-[15px] leading-6 text-zinc-500">
                Tell us a little about yourself before you start swapping
                skills.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  disabled={otpSent}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-zinc-100"
                />
              </div>

              {/* USERNAME */}

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Username
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-zinc-400">
                    @
                  </span>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_]/g, "")
                      )
                    }
                    placeholder="yourusername"
                    required
                    minLength={3}
                    disabled={otpSent}
                    className="h-12 w-full rounded-xl border border-zinc-300 bg-white pl-9 pr-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-zinc-100"
                  />
                </div>

                <p className="mt-1.5 text-xs text-zinc-400">
                  Letters, numbers and underscores only.
                </p>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Email address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={otpSent}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-zinc-100"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Phone number
                </label>

                <div className="flex gap-2">
                  <div className="flex h-12 items-center rounded-xl border border-zinc-300 bg-zinc-50 px-4 text-sm font-bold text-zinc-600">
                    +91
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="9876543210"
                    required
                    disabled={otpSent}
                    className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-zinc-100"
                  />
                </div>

                <p className="mt-1.5 text-xs text-zinc-400">
                  We'll send a one-time password to verify your number.
                </p>
              </div>

              {/* OTP */}

              {otpSent && !verified && (
                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <div className="mb-3">
                    <label className="block text-sm font-bold text-zinc-900">
                      Enter OTP
                    </label>

                    <p className="mt-1 text-xs text-zinc-500">
                      We sent a verification code to +91 {phone}
                    </p>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={8}
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 8)
                      )
                    }
                    placeholder="Enter OTP"
                    className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-center text-xl font-bold tracking-[0.4em] text-zinc-950 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />

                  <button
                    type="button"
                    disabled={otpLoading || otp.length < 4}
                    onClick={handleVerifyOtp}
                    className="mt-3 h-11 w-full rounded-xl bg-violet-600 font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {otpLoading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="font-semibold text-violet-600 hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>

                    <button
                      type="button"
                      onClick={changePhoneNumber}
                      disabled={otpLoading}
                      className="font-semibold text-zinc-500 hover:text-zinc-800 disabled:opacity-50"
                    >
                      Change number
                    </button>
                  </div>
                </div>
              )}

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-sm font-bold text-zinc-900">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  disabled={otpSent}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-[16px] font-semibold text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-zinc-100"
                />

                <p className="mt-1.5 text-xs text-zinc-400">
                  Minimum 6 characters.
                </p>
              </div>

              {/* BIO */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-900">
                    Bio
                  </label>

                  <span className="text-xs font-medium text-zinc-400">
                    Optional
                  </span>
                </div>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people a little about yourself..."
                  maxLength={160}
                  rows={3}
                  disabled={otpSent}
                  className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-[16px] font-medium text-zinc-950 outline-none transition placeholder:text-[15px] placeholder:font-normal placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 disabled:bg-zinc-100"
                />

                <p className="mt-1 text-right text-xs text-zinc-400">
                  {bio.length}/160
                </p>
              </div>

              {/* AVATAR */}

              <div>
                <label className="mb-3 block text-sm font-bold text-zinc-900">
                  Choose your avatar
                </label>

                <div className="grid grid-cols-5 gap-3">
                  {avatars.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatar(item.id)}
                      disabled={otpSent}
                      className={`flex aspect-square items-center justify-center rounded-2xl border text-2xl transition ${
                        avatar === item.id
                          ? "border-violet-500 bg-violet-50 ring-4 ring-violet-500/10"
                          : "border-zinc-200 bg-zinc-50 hover:border-violet-300 hover:bg-violet-50"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {item.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* CREATE ACCOUNT */}

              {!otpSent && (
                <button
                  type="submit"
                  disabled={
                    otpLoading ||
                    loading ||
                    !msg91Ready
                  }
                  className="group flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {otpLoading
                    ? "Sending OTP..."
                    : !msg91Ready
                      ? "Loading OTP service..."
                      : "Create Account"}

                  {!otpLoading && msg91Ready && (
                    <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  )}
                </button>
              )}
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-200" />

              <span className="text-xs font-semibold text-zinc-400">
                OR
              </span>

              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <p className="text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-violet-600 hover:text-violet-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs font-medium text-zinc-400">
            Learn what you know. Discover what you don't.
          </p>
        </div>
      </div>
    </main>
  );
}