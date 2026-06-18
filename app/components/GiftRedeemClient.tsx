"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type BookOption = { slug: string; title: string };

const inputClass = "mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral";
const labelClass = "text-xs font-extrabold uppercase tracking-[0.12em] text-teal";

type SuccessKind = "new" | "added-loggedin" | "added-existing";

export default function GiftRedeemClient({ initialCode, bookOptions }: { initialCode: string; bookOptions: BookOption[] }) {
  const [code, setCode] = useState(initialCode);
  const [bookSlug, setBookSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [consent, setConsent] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [redeemedEmail, setRedeemedEmail] = useState("");
  const [successKind, setSuccessKind] = useState<SuccessKind>("new");

  // Session detection: signed-in members claim straight to their account.
  const [loggedIn, setLoggedIn] = useState(false);
  const [sessionEmail, setSessionEmail] = useState("");

  useEffect(() => {
    let alive = true;
    async function checkSession() {
      try {
        const res = await fetch("/api/portal/me", { credentials: "include" });
        const data = (await res.json()) as { authenticated?: boolean; user?: { email?: string } };
        if (alive && data.authenticated) {
          setLoggedIn(true);
          setSessionEmail(data.user?.email || "");
        }
      } catch {
        // treat as logged out
      }
    }
    checkSession();
    return () => {
      alive = false;
    };
  }, []);

  async function submitRedeem() {
    setState("loading");
    setMessage(null);
    try {
      const response = await fetch("/api/gift/redeem", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        // Signed-in members send only the code/book; the server uses the session.
        body: JSON.stringify(loggedIn ? { code, bookSlug } : { code, email, password, consent, bookSlug })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { ok?: boolean; error?: string; createdAccount?: boolean; loggedIn?: boolean; email?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "We could not redeem this code.");
      setRedeemedEmail(data.email || sessionEmail || email);
      setSuccessKind(data.createdAccount ? "new" : data.loggedIn ? "added-loggedin" : "added-existing");
      setState("done");
    } catch (e) {
      setState("error");
      setMessage(e instanceof Error ? e.message : "We could not redeem this code.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loggedIn && password && password !== confirm) {
      setState("error");
      setMessage("Passwords do not match.");
      return;
    }
    await submitRedeem();
  }

  if (state === "done") {
    const goLibrary = successKind === "added-loggedin";
    return (
      <div className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-teal/30 bg-teal/5 p-8 text-center shadow-soft">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-coral/15 text-3xl">🎉</div>
        <h2 className="mt-4 font-serif text-3xl font-bold text-teal">
          {successKind === "new" ? "Congratulations — your account is set up! ♥" : "Your gift has been added! ♥"}
        </h2>
        <p className="mt-3 text-ink">
          {successKind === "new"
            ? "Your new account is ready and your free book is waiting in your library. Please log in to start reading."
            : successKind === "added-loggedin"
              ? "We added this book to your library. It's ready to read right now."
              : "We added this book to your existing account. Log in to start reading it any time."}
        </p>
        {redeemedEmail && !goLibrary && (
          <p className="mt-4 rounded-2xl border border-tan bg-white/70 px-4 py-3 text-sm text-ink">
            Sign in with: <span className="font-extrabold text-teal">{redeemedEmail}</span>
          </p>
        )}
        <Link href={goLibrary ? "/portal/library" : "/portal/login"} className="btn mt-6 w-full sm:w-auto">
          {goLibrary ? "Go to My Library" : "Log in to my account"}
        </Link>
        {!goLibrary && (
          <p className="mt-4 text-xs text-ink/60">
            Trouble signing in? <Link href="/forgot-password" className="font-bold text-teal underline decoration-coral/40 underline-offset-4">Reset your password</Link>
          </p>
        )}
      </div>
    );
  }

  // ---- Signed-in members: one-step claim, no email/password ----
  if (loggedIn) {
    return (
      <form onSubmit={handleSubmit} className="mx-auto mt-4 max-w-xl rounded-[2rem] border border-tan bg-white/85 p-6 text-left shadow-soft sm:p-8">
        <p className="rounded-2xl border border-teal/20 bg-teal/5 px-4 py-3 text-sm text-teal">
          You&apos;re signed in{sessionEmail ? <> as <span className="font-extrabold">{sessionEmail}</span></> : ""}. This gift will be added straight to your library.
        </p>

        <div className="mt-5">
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

        {message && <p className="mt-4 rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-[#8a3039]">{message}</p>}

        <button type="submit" disabled={state === "loading"} className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
          {state === "loading" ? "Adding to your library…" : "Claim to my library ♥"}
        </button>
      </form>
    );
  }

  // ---- Not signed in: claim + create/sign-in by email ----
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
        <p className="mt-1 text-xs text-ink/60">Already have an account? Enter that email and <Link href="/portal/login" className="font-bold text-teal underline decoration-coral/40 underline-offset-4">sign in first</Link> to skip the steps below.</p>
      </div>

      <div className="mt-5">
        <label className={labelClass}>Create a password <span className="text-ink/50">(new accounts only)</span></label>
        <input type="password" autoComplete="new-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} placeholder="At least 8 characters" />
        <p className="mt-1 text-xs text-ink/60">New here? Pick a password. Existing member? Leave this blank.</p>
      </div>

      {password && (
        <div className="mt-4">
          <label className={labelClass}>Confirm password</label>
          <input type="password" autoComplete="new-password" className={inputClass} value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} placeholder="Re-enter your password" />
        </div>
      )}

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
