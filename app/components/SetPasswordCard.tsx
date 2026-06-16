"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type State = "checking" | "new" | "returning";

// Post-order account messaging. New accounts are emailed a tokenized setup link
// (handled in fulfillment), so this card no longer collects a password — it just
// tells the buyer what to do next.
export default function SetPasswordCard({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let active = true;
    async function checkStatus() {
      try {
        const response = await fetch(`/api/portal/set-password?session_id=${encodeURIComponent(sessionId)}`);
        const raw = await response.text();
        const data = (raw ? JSON.parse(raw) : {}) as { accountExists?: boolean; passwordSet?: boolean };
        if (!active) return;
        setState(data.passwordSet ? "returning" : "new");
      } catch {
        if (active) setState("new");
      }
    }
    checkStatus();
    return () => {
      active = false;
    };
  }, [sessionId]);

  if (state === "checking") {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-tan bg-white/70 p-6 text-center shadow-soft">
        <p className="font-bold text-teal">Checking your account…</p>
      </div>
    );
  }

  if (state === "returning") {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-tan bg-white/80 p-6 text-center shadow-soft">
        <h2 className="font-serif text-2xl font-bold text-teal">Welcome back ♥</h2>
        <p className="mt-2 text-sm text-ink">This order is on your existing account. Sign in to find it and your books.</p>
        <Link href="/portal/login" className="btn mt-5">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-teal/30 bg-teal/5 p-6 text-center shadow-soft">
      <h2 className="font-serif text-2xl font-bold text-teal">Check your email ♥</h2>
      <p className="mt-2 text-sm text-ink">
        We've sent a link to <strong>finish setting up your account</strong> and create your password. Once it's set, your orders and book downloads live in your Customer Portal.
      </p>
      <p className="mt-4 text-xs text-ink/70">
        Didn't get it? <Link href="/forgot-password" className="font-bold text-teal underline decoration-coral/40 underline-offset-4">Request a new link</Link>
        {" · "}
        <Link href="/portal/login" className="font-bold text-teal underline decoration-coral/40 underline-offset-4">Already set up? Sign in</Link>
      </p>
    </div>
  );
}
