"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Giftable = {
  downloadId: string | number;
  bookTitle: string;
  format: "digital" | "audiobook";
  formatLabel: string;
  giftableRemaining: number;
};

type Gift = {
  id: string | number;
  code: string;
  status: string;
  recipientEmail?: string;
  format?: string;
  expiresAt?: string;
  redeemedAt?: string;
  createdAt?: string;
};

type GiftsResponse = { giftable?: Giftable[]; gifts?: Gift[]; error?: string };

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    sent: "bg-teal/10 text-teal",
    redeemed: "bg-coral/10 text-coral",
    revoked: "bg-ink/10 text-ink/70",
    expired: "bg-ink/10 text-ink/70"
  };
  return map[status] || "bg-ink/10 text-ink/70";
}

export default function PortalGiftsClient() {
  const [giftable, setGiftable] = useState<Giftable[]>([]);
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [downloadId, setDownloadId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  async function load() {
    try {
      const response = await fetch("/api/portal/gifts", { credentials: "include" });
      const data = (await response.json()) as GiftsResponse;
      if (!response.ok) throw new Error(data.error || "Please sign in to manage gifts.");
      setGiftable(data.giftable || []);
      setGifts(data.gifts || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load gifts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createGift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setNewCode(null);
    try {
      const response = await fetch("/api/portal/gifts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ downloadId, recipientEmail, message })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { gift?: { code?: string }; error?: string };
      if (!response.ok || !data.gift?.code) throw new Error(data.error || "Could not create the gift.");
      setNewCode(data.gift.code);
      setNotice("Gift code created. Share it with your recipient (email coming once our mail system is live).");
      setRecipientEmail("");
      setMessage("");
      setDownloadId("");
      await load();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not create the gift.");
    } finally {
      setSaving(false);
    }
  }

  async function revoke(id: string | number) {
    if (!window.confirm("Revoke this gift code? The download slot will be returned to you.")) return;
    setBusyId(id);
    try {
      const response = await fetch("/api/portal/gifts", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "revoke" })
      });
      const raw = await response.text();
      const data = (raw ? JSON.parse(raw) : {}) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not revoke this gift.");
      await load();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not revoke this gift.");
    } finally {
      setBusyId(null);
    }
  }

  function copyCode(code: string) {
    if (navigator?.clipboard) navigator.clipboard.writeText(code).catch(() => undefined);
  }

  if (loading) return <p className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-soft">Loading your gifts…</p>;

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  const canGift = giftable.some((g) => g.giftableRemaining > 0);

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-6">
      {notice && <p className="rounded-2xl border border-teal/30 bg-teal/5 px-4 py-3 text-center text-sm font-semibold text-teal">{notice}</p>}

      {newCode && (
        <div className="rounded-[1.5rem] border border-coral/40 bg-coral/5 p-5 text-center shadow-soft">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">New gift code</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-teal">{newCode}</p>
          <button type="button" className="btn mt-4" onClick={() => copyCode(newCode)}>Copy code</button>
          <p className="mt-3 text-xs text-ink/70">Share <span className="font-bold">{`${typeof window !== "undefined" ? window.location.origin : ""}/gift/redeem?code=${newCode}`}</span> with your recipient.</p>
        </div>
      )}

      <div className="rounded-[1.5rem] border border-tan bg-white/85 p-5 shadow-soft sm:p-6">
        <h2 className="font-serif text-2xl font-bold text-teal">Gift a digital book</h2>
        {!canGift ? (
          <p className="mt-3 text-ink">You don&apos;t have any gift slots available yet. Gift slots come from your digital and audiobook downloads.</p>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={createGift}>
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-teal/80">Choose a book</label>
              <select className="w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink" value={downloadId} onChange={(e) => setDownloadId(e.target.value)} required>
                <option value="">Select a book to gift…</option>
                {giftable.filter((g) => g.giftableRemaining > 0).map((g) => (
                  <option key={String(g.downloadId)} value={String(g.downloadId)}>
                    {g.bookTitle} — {g.formatLabel} ({g.giftableRemaining} gift{g.giftableRemaining === 1 ? "" : "s"} left)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-teal/80">Recipient email</label>
              <input type="email" className="w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} required placeholder="friend@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-teal/80">Message (optional)</label>
              <textarea className="w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} placeholder="A little note for your friend" />
            </div>
            <button type="submit" className="btn" disabled={saving}>{saving ? "Creating…" : "Create gift code"}</button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-serif text-xl font-bold text-teal/90">Your gift codes</h3>
        {!gifts.length ? (
          <p className="rounded-2xl border border-tan bg-white/60 px-4 py-4 text-sm text-ink/70">No gift codes yet.</p>
        ) : (
          <div className="overflow-hidden rounded-[1.25rem] border border-tan bg-white/75 shadow-soft">
            {gifts.map((g) => (
              <div key={String(g.id)} className="flex flex-wrap items-center justify-between gap-3 border-b border-tan px-4 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="font-mono text-lg font-bold tracking-wide text-teal">{g.code}</p>
                  <p className="text-xs text-ink/70">{g.recipientEmail || "—"} · {g.format === "audiobook" ? "Audiobook" : "PDF / EPUB"} · expires {formatDate(g.expiresAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] ${statusBadge(String(g.status))}`}>{String(g.status)}</span>
                  {g.status === "sent" && (
                    <>
                      <button type="button" className="rounded-full border border-tan px-3 py-1.5 text-xs font-bold text-teal hover:bg-cream/60" onClick={() => copyCode(g.code)}>Copy</button>
                      <button type="button" className="rounded-full border border-coral/40 px-3 py-1.5 text-xs font-bold text-coral hover:bg-coral/10 disabled:opacity-50" onClick={() => revoke(g.id)} disabled={busyId === g.id}>Revoke</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
