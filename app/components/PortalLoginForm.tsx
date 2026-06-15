"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LoginState = "idle" | "loading" | "success" | "error";

export default function PortalLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<LoginState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = (await response.json().catch(() => null)) as { message?: string; user?: { role?: string } } | null;

      if (!response.ok) {
        throw new Error(data?.message || "We could not sign you in. Please check your email and password.");
      }

      setState("success");
      setMessage("Signed in successfully. Taking you to your portal...");
      // Refresh so server components pick up the new auth cookie, then redirect.
      router.refresh();
      setTimeout(() => {
        router.push("/portal");
      }, 700);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not sign you in. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-xl rounded-[2rem] border border-tan bg-white/80 p-6 text-left shadow-soft sm:p-8">
      <div>
        <label htmlFor="portal-email" className="text-sm font-extrabold uppercase tracking-[0.12em] text-teal">Email</label>
        <input
          id="portal-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral"
          placeholder="you@example.com"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="portal-password" className="text-sm font-extrabold uppercase tracking-[0.12em] text-teal">Password</label>
        <input
          id="portal-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-tan bg-white px-4 py-3 text-ink outline-none transition focus:border-coral"
          placeholder="Your password"
        />
      </div>

      {message && (
        <p className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-bold ${state === "success" ? "border-teal/20 bg-teal/5 text-teal" : "border-coral/30 bg-coral/10 text-[#8a3039]"}`}>
          {message}
        </p>
      )}

      <button type="submit" disabled={state === "loading" || state === "success"} className="btn mt-6 w-full disabled:cursor-not-allowed disabled:opacity-70">
        {state === "loading" ? "Signing In..." : state === "success" ? "Redirecting..." : "Sign In ♥"}
      </button>

      <p className="mt-5 text-center text-sm leading-6 text-ink/80">
        Customer accounts are created after purchase. Password reset and account activation emails will be added after the email system is cleared.
      </p>

      <div className="mt-5 text-center">
        <Link href="/portal" className="font-bold text-teal underline decoration-coral/40 underline-offset-4 hover:text-coral">Back to portal overview</Link>
      </div>
    </form>
  );
}
