"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      inquiryType: String(formData.get("inquiryType") || "").trim(),
      message: String(formData.get("message") || "").trim()
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to send your message right now.");
      }

      form.reset();
      setSubmitState("success");
      setMessage("Thank you — your message was sent. We will reply as soon as we can.");
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your message right now.");
    }
  }

  return (
    <form className="panel-card rounded-3xl p-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-extrabold text-teal">
          Name
          <input
            name="name"
            type="text"
            placeholder="Your name"
            required
            className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
          />
        </label>
        <label className="text-sm font-extrabold text-teal">
          Email
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-extrabold text-teal">
        What&rsquo;s this about?
        <select
          name="inquiryType"
          required
          className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
        >
          <option>General question</option>
          <option>School / library visit</option>
          <option>Press & media inquiry</option>
          <option>Bulk / wholesale order</option>
          <option>Something else</option>
        </select>
      </label>

      <label className="mt-4 block text-sm font-extrabold text-teal">
        Message
        <textarea
          name="message"
          placeholder="How can we help?"
          required
          className="mt-2 min-h-36 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
        />
      </label>

      <button className="btn mt-5 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "Sending..." : "Send Message ♥"}
      </button>

      {message ? (
        <p className={`mt-3 text-sm font-bold ${submitState === "success" ? "text-teal" : "text-coral"}`}>
          {message}
        </p>
      ) : (
        <p className="mt-3 text-xs text-[#6b7d80]">
          Your message will be sent directly through this form. No email app required.
        </p>
      )}
    </form>
  );
}
