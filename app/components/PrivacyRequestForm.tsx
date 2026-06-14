"use client";

import { FormEvent, useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

const requestTypes = [
  { label: "Access / Know what information you have", value: "access" },
  { label: "Delete my information", value: "delete" },
  { label: "Correct my information", value: "correct" },
  { label: "Do Not Sell or Share", value: "do-not-sell-share" },
  { label: "Limit sensitive information", value: "limit-sensitive" },
  { label: "Unsubscribe from email", value: "unsubscribe-email" },
  { label: "Opt out of SMS", value: "opt-out-sms" },
  { label: "Other privacy request", value: "other" }
];

export default function PrivacyRequestForm() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      requestType: String(formData.get("requestType") || "").trim(),
      state: String(formData.get("state") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      contactConsent: formData.get("contactConsent") === "on"
    };

    try {
      const response = await fetch("/api/privacy-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to submit your request right now.");
      }

      form.reset();
      setSubmitState("success");
      setMessage("Your privacy request was submitted. We will review it and follow up if verification is needed.");
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit your request right now.");
    }
  }

  return (
    <form className="mt-8 rounded-3xl border border-tan bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <h2 className="font-serif text-2xl text-teal">Submit a Privacy Request</h2>
      <p className="mt-2 text-sm font-bold text-ink">
        Use this form for access, deletion, correction, Do Not Sell/Share, email unsubscribe, SMS opt-out, and other privacy requests.
      </p>

      <label className="mt-5 block text-sm font-extrabold text-teal">
        Request Type
        <select
          name="requestType"
          required
          className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
        >
          {requestTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-extrabold text-teal">
          State of Residence
          <input
            name="state"
            type="text"
            placeholder="California, Texas, etc."
            required
            className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
          />
        </label>
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
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
        <label className="text-sm font-extrabold text-teal">
          Phone <span className="font-bold text-[#6b7d80]">optional</span>
          <input
            name="phone"
            type="tel"
            placeholder="Phone number if relevant"
            className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-extrabold text-teal">
        Request Details
        <textarea
          name="message"
          placeholder="Tell us what you are requesting. Do not include sensitive medical, financial, or government ID information."
          required
          className="mt-2 min-h-32 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral"
        />
      </label>

      <label className="mt-5 flex gap-3 rounded-2xl border border-tan bg-green/70 p-4 text-sm font-bold leading-relaxed text-ink">
        <input className="mt-1 h-4 w-4 shrink-0" name="contactConsent" required type="checkbox" />
        <span>
          I confirm this is a genuine privacy request and agree that Benny &amp; Penny&apos;s Adventures may contact me using the information provided to verify and process this request.
        </span>
      </label>

      <button className="btn mt-5 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={submitState === "submitting"}>
        {submitState === "submitting" ? "Submitting..." : "Submit Privacy Request"}
      </button>

      {message ? (
        <p className={`mt-3 text-sm font-bold ${submitState === "success" ? "text-teal" : "text-coral"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
