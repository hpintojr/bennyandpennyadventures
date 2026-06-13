"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "submitting" | "error";

export default function NewsletterForm({ compact = false, source = "website" }: { compact?: boolean; source?: string }) {
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source })
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
      {message ? <p className="mt-2 text-sm font-bold text-coral">{message}</p> : null}
    </form>
  );
}
