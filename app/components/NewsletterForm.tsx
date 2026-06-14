"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type SubmitState = "idle" | "submitting" | "error";

const emailConsentText = "I agree to receive occasional email updates from Benny & Penny's Adventures. I can unsubscribe at any time.";

export default function NewsletterForm({ compact = false, source = "website" }: { compact?: boolean; source?: string }) {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          emailOptIn: formData.get("emailOptIn") === "on",
          emailConsentText
        })
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to save your signup right now.");
      }

      const params = new URLSearchParams();
      params.set("email", email);
      window.location.href = `/thank-you?${params.toString()}`;
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Unable to save your signup right now.");
    }
  }

  return (
    <form onSubmit={submit} className={`${compact ? "mt-3" : "mt-5"}`}>
      <div className="flex overflow-hidden rounded-full border border-tan bg-white">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="min-w-0 flex-1 px-5 py-3 text-ink outline-none"
        />
        <button className="bg-coral px-5 py-3 font-serif text-white transition hover:bg-[#d95660] disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={submitState === "submitting"}>
          {submitState === "submitting" ? "Saving..." : "Sign Me Up ♥"}
        </button>
      </div>
      <label className="mt-3 flex gap-2 text-xs font-bold leading-relaxed text-[#5f6f72]">
        <input className="mt-0.5 h-4 w-4 shrink-0" name="emailOptIn" required type="checkbox" />
        <span>
          {emailConsentText} See our <Link className="font-extrabold text-coral" href="/privacy">Privacy Policy</Link>.
        </span>
      </label>
      {message ? <p className="mt-2 text-sm font-bold text-coral">{message}</p> : null}
    </form>
  );
}
