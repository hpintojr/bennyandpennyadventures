"use client";

import { FormEvent, useState } from "react";

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (email) params.set("email", email);
    window.location.href = `/thank-you?${params.toString()}`;
  }

  return (
    <form onSubmit={submit} className={`flex overflow-hidden rounded-full border border-tan bg-white ${compact ? "mt-3" : "mt-5"}`}>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your email"
        className="min-w-0 flex-1 px-5 py-3 text-ink outline-none"
      />
      <button className="bg-coral px-5 py-3 font-serif text-white transition hover:bg-[#d95660]" type="submit">
        Sign Me Up ♥
      </button>
    </form>
  );
}
