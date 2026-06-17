"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string | number;
  subject?: string;
  category?: string;
  status?: string;
  priority?: string;
  message?: string;
  createdAt?: string;
};

const CATEGORIES = [
  { value: "order", label: "Order issue" },
  { value: "download", label: "Download help" },
  { value: "audiobook", label: "Audiobook help" },
  { value: "print-shipping", label: "Print or shipping" },
  { value: "bulk-order", label: "Bulk order" },
  { value: "institutional", label: "School or hospital" },
  { value: "general", label: "General question" }
];

const FIELD = "w-full rounded-2xl border border-tan bg-white px-4 py-2.5 text-ink outline-none transition focus:border-coral";
const LABEL = "block text-sm font-extrabold text-teal";

function shortDate(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusTone(status?: string) {
  if (status === "resolved" || status === "closed") return "bg-green text-teal";
  if (status === "pending") return "bg-coral/12 text-coral";
  return "bg-teal/10 text-teal";
}

function categoryLabel(value?: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || "General";
}

export default function PortalHelpClient() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function loadTickets() {
    try {
      const res = await fetch("/api/portal/support", { credentials: "include" });
      const json = (await res.json()) as { tickets?: Ticket[] };
      setTickets(json.tickets || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/portal/support", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, message })
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not submit your request.");
      setSent(true);
      setSubject("");
      setMessage("");
      setCategory("general");
      loadTickets();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* New request */}
      <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-bold text-teal">Ask us anything</h2>
        <p className="mt-1 text-sm text-ink/70">Order help, downloads, shipping, bulk orders for schools or hospitals — we&apos;re here.</p>

        {sent && (
          <div className="mt-4 rounded-2xl border border-teal/20 bg-teal/5 p-4 text-sm text-teal">
            Thanks — your request is in. We&apos;ll reply by email. It&apos;s listed under &ldquo;Your requests&rdquo; too.
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className={LABEL} htmlFor="category">Topic</label>
            <select id="category" className={`mt-1.5 ${FIELD}`} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="subject">Subject</label>
            <input id="subject" className={`mt-1.5 ${FIELD}`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary" required />
          </div>
          <div>
            <label className={LABEL} htmlFor="message">How can we help?</label>
            <textarea id="message" rows={5} className={`mt-1.5 ${FIELD}`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what's going on…" required />
          </div>
          {formError && <p className="text-sm font-bold text-coral">{formError}</p>}
          <button type="submit" disabled={submitting} className="btn w-full disabled:opacity-60">{submitting ? "Sending…" : "Send request"}</button>
        </form>
      </section>

      {/* Existing requests + quick links */}
      <div className="space-y-6">
        <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-2xl font-bold text-teal">Your requests</h2>
          {loading ? (
            <p className="mt-4 text-sm text-ink/70">Loading…</p>
          ) : tickets.length ? (
            <ul className="mt-4 space-y-2.5">
              {tickets.map((t) => (
                <li key={t.id} className="rounded-2xl border border-tan bg-cream/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-teal">{t.subject}</p>
                      <p className="text-xs text-ink/55">{categoryLabel(t.category)} · {shortDate(t.createdAt)}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold capitalize ${statusTone(t.status)}`}>{t.status || "open"}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl border border-dashed border-tan bg-cream/40 p-4 text-sm text-ink/70">No requests yet. Anything you send will show up here.</p>
          )}
        </section>

        <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-2xl font-bold text-teal">Quick answers</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li><span className="font-bold text-teal">Where are my downloads?</span> In <a href="/portal/library" className="font-extrabold text-coral">My Library</a>.</li>
            <li><span className="font-bold text-teal">How do reading slots work?</span> Each book license has 3 slots shared across PDF/EPUB downloads and gifts.</li>
            <li><span className="font-bold text-teal">Where&apos;s my package?</span> Track print orders under <a href="/portal/orders" className="font-extrabold text-coral">My Orders</a>.</li>
          </ul>
          <a href="/contact" className="btn-ghost mt-4 w-full justify-center text-sm">Contact page</a>
        </section>
      </div>
    </div>
  );
}
