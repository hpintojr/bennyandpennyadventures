"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type BookOption = { slug: string; title: string };

const inputClass = "mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral";
const labelClass = "text-xs font-extrabold uppercase tracking-[0.12em] text-teal";

export default function GiftRedeemClient({ initialCode, bookOptions }: { initialCode: string; bookOptions: BookOption[] }) {
  const [code, setCode] = useState(initialCode);
  const [bookSlug, setBookSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password && password !== confirm) {
      setState("error");
      setMessage("Passwords do not match.");
      return;
    }
    setState("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email, password, consent, bookSlug })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { ok?: boolean; error?: string; createdAccount?: boolean };
      if (!response.ok || !data.ok) throw new Error(data.error || "We could not redeem this code.");
      setState("done");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "We could not redeem this code.");
    }
  }

  if (state === "done") {
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-teal/30 bg-teal/5 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">Your book is ready ♥</h2>
        <p className="mt-3 text-ink">Sign in to your library to read it any time.</p>
        <Link href="/portal/login" className="btn mt-6">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-tan bg-white/85 p-6 text-left shadow-soft sm:p-8">
      <div>
        <label className={labelClass}>Gift code</label>
        <input className={`${inputClass} font-mono tracking-widest`} value={code} onChange={(e) => setCode(e.target.value)} required placeholder="BPG12345" />
      </div>

      {bookOptions.length > 0 && (
        <div className="mt-5">
          <label className={labelClass}>Choose your book</label>
          <select className={inputClass} value={bookSlug} onChange={(e) => setBookSlug(e.target.value)}>
            <option value="">Use the gifted book</option>
            {bookOptions.map((b) => (
              <option key={b.slug} value={b.slug}>{b.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-5">
        <label className={labelClass}>Email</label>
        <input type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
      </div>

      <div className="mt-5">
        <label className={labelClass}>Create a password</label>
        <input type="password" autoComplete="new-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} placeholder="At least 8 characters" />
        <p className="mt-1 text-xs text-ink/60">Already have an account? Use the same email — we&apos;ll just add this book to it.</p>
      </div>

      <div className="mt-4">
        <label className={labelClass}>Confirm password</label>
        <input type="password" autoComplete="new-password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} placeholder="Re-enter your password" />
      </div>

      <label className="mt-5 flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Email me occasional Benny &amp; Penny updates and offers. You can unsubscribe any time.</span>
      </label>

      {message && <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-[#8a3039]">{message}</p>}

      <button type="submit" disabled={state === "loading"} className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
        {state === "loading" ? "Claiming your book…" : "Claim my free book ♥"}
      </button>
    </form>
  );
}
