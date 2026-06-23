"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SetPasswordByTokenClient({ legacyToken }: { legacyToken: string }) {
  const [fragmentToken, setFragmentToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const tokenFromFragment = params.get("token")?.trim() || "";

    if (tokenFromFragment) {
      setFragmentToken(tokenFromFragment);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    // Support links sent before fragment-based tokens were introduced, then
    // remove the sensitive query string from the address bar immediately.
    if (legacyToken) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [legacyToken]);

  const token = fragmentToken || legacyToken;

  if (!token) {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-tan bg-white/80 p-8 text-center shadow-soft">
        <h2 className="font-serif text-2xl font-bold text-teal">Link not found</h2>
        <p className="mt-3 text-ink">This page needs a valid setup link from your email. Request a new one below.</p>
        <Link href="/forgot-password" className="btn mt-5">Email me a new link</Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 8) { setState("error"); setMessage("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setState("error"); setMessage("Passwords do not match."); return; }
    setState("loading"); setMessage(null);
    try {
      const response = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "We could not set your password.");
      setState("done");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "We could not set your password.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-teal/30 bg-teal/5 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">You&apos;re all set ♥</h2>
        <p className="mt-3 text-ink">Your password is ready. Sign in to access your portal.</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-tan bg-white/85 p-6 text-left shadow-soft sm:p-8">
      <div>
        <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">New password</label>
        <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral" placeholder="At least 8 characters" />
      </div>
      <div className="mt-4">
        <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-teal">Confirm password</label>
        <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8}
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral" placeholder="Re-enter your password" />
      </div>
      {message && <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-[#8a3039]">{message}</p>}
      <button type="submit" disabled={state === "loading"} className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
        {state === "loading" ? "Saving…" : "Save my password"}
      </button>
    </form>
  );
}
