"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

export default function EmailLinkRequestClient({
  endpoint,
  withName = false,
  buttonLabel,
  successTitle,
  successText
}: {
  endpoint: string;
  withName?: boolean;
  buttonLabel: string;
  successTitle: string;
  successText: string;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage(null);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName: withName ? firstName : undefined })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { ok?: boolean; error?: string };
      if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setState("done");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-teal/30 bg-teal/5 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">{successTitle}</h2>
        <p className="mt-3 text-ink">{successText}</p>
        <Link href="/portal/login" className="btn mt-6">Back to Sign In</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-tan bg-white/85 p-6 text-left shadow-soft sm:p-8">
      {withName && (
        <div className="mb-4">
          <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">First name (optional)</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral" placeholder="Your name" />
        </div>
      )}
      <div>
        <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">Email</label>
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral" placeholder="you@example.com" />
      </div>
      {message && <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-[#8a3039]">{message}</p>}
      <button type="submit" disabled={state === "loading"} className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
        {state === "loading" ? "Sending…" : buttonLabel}
      </button>
      <p className="mt-5 text-center text-sm text-ink/70">Already have an account? <Link href="/portal/login" className="font-bold text-teal underline decoration-coral/40 underline-offset-4">Sign in</Link></p>
    </form>
  );
}
