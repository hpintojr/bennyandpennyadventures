"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";

type State = "idle" | "loading" | "done" | "already" | "error";

export default function SetPasswordCard({ sessionId }: { sessionId: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) {
      setState("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setState("error");
      setMessage("Passwords do not match.");
      return;
    }
    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/portal/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, password })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { ok?: boolean; error?: string; alreadySet?: boolean };

      if (response.ok && data.ok) {
        setState("done");
        return;
      }
      if (data.alreadySet) {
        setState("already");
        return;
      }
      throw new Error(data.error || "We could not set your password. Please try again.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not set your password.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-teal/30 bg-teal/5 p-6 text-center shadow-soft">
        <h2 className="font-serif text-2xl font-bold text-teal">Your account is ready ♥</h2>
        <p className="mt-2 text-sm text-ink">Your password is set. Sign in to view your orders and access your books.</p>
        <Link href="/portal/login" className="btn mt-5">Sign In</Link>
      </div>
    );
  }

  if (state === "already") {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-tan bg-white/80 p-6 text-center shadow-soft">
        <h2 className="font-serif text-2xl font-bold text-teal">You already have an account</h2>
        <p className="mt-2 text-sm text-ink">This email already has a password. Sign in to access your portal.</p>
        <Link href="/portal/login" className="btn mt-5">Sign In</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 max-w-xl rounded-3xl border border-tan bg-white/80 p-6 text-left shadow-soft sm:p-8">
      <h2 className="text-center font-serif text-2xl font-bold text-teal">Set up your account ♥</h2>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink">
        Create a password to access your Customer Portal — your orders, addresses, and book downloads in one place.
      </p>

      <div className="mt-5">
        <label htmlFor="set-password" className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">New password</label>
        <input
          id="set-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral"
          placeholder="At least 8 characters"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="set-password-confirm" className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">Confirm password</label>
        <input
          id="set-password-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral"
          placeholder="Re-enter your password"
        />
      </div>

      {message && <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-[#8a3039]">{message}</p>}

      <button type="submit" disabled={state === "loading"} className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
        {state === "loading" ? "Setting password..." : "Create my account password"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/70">Already set a password? <Link href="/portal/login" className="font-bold text-teal underline decoration-coral/40 underline-offset-4">Sign in</Link></p>
    </form>
  );
}
