"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (data.success) setStep("verify");
    setLoading(false);
  }

  async function handleVerify() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    setMessage(data.message);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900 dark:text-white">
          OTP Баталгаажуулалт
        </h1>

        {step === "email" ? (
          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email хаяг"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Илгээж байна..." : "Код илгээх"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-zinc-900 dark:text-white">{email}</span> руу код илгээгдлээ
            </p>
            <input
              type="text"
              placeholder="6 оронтой код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-2xl tracking-widest text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Шалгаж байна..." : "Баталгаажуулах"}
            </button>
            <button
              onClick={() => { setStep("email"); setCode(""); setMessage(""); }}
              className="text-sm text-blue-500 hover:underline"
            >
              Буцах
            </button>
          </div>
        )}

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
