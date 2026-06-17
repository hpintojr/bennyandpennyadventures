"use client";

import { useEffect, useState } from "react";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  smsMarketingOptIn: boolean;
  passwordSetByCustomer: boolean;
};

const FIELD = "w-full rounded-2xl border border-tan bg-white px-4 py-2.5 text-ink outline-none transition focus:border-coral";
const LABEL = "block text-sm font-extrabold text-teal";

export default function PortalAccountClient() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const [resetBusy, setResetBusy] = useState(false);
  const [resetNote, setResetNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/portal/account", { credentials: "include" });
        const json = (await res.json()) as { profile?: Profile; error?: string };
        if (!res.ok || !json.profile) throw new Error(json.error || "Please sign in.");
        if (alive) setProfile(json.profile);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Could not load your account.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
    setSavedNote(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSavedNote(null);
    setError(null);
    try {
      const res = await fetch("/api/portal/account", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          smsMarketingOptIn: profile.smsMarketingOptIn
        })
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "Could not save.");
      setSavedNote("Saved ♥");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function sendReset() {
    if (!profile?.email) return;
    setResetBusy(true);
    setResetNote(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email })
      });
      const json = (await res.json()) as { message?: string };
      setResetNote(json.message || "If an account exists, we've sent a link.");
    } catch {
      setResetNote("Could not send the link right now. Please try again.");
    } finally {
      setResetBusy(false);
    }
  }

  if (loading) return <div className="rounded-3xl border border-tan bg-white/70 p-8 text-center font-bold text-teal shadow-sm">Loading your account…</div>;
  if (error && !profile) return <div className="rounded-3xl border border-tan bg-white/70 p-8 text-center text-ink shadow-sm">{error}</div>;
  if (!profile) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Profile */}
      <form onSubmit={save} className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-2xl font-bold text-teal">Your profile</h2>
        <p className="mt-1 text-sm text-ink/70">This is how we address you and reach you about orders.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="firstName">First name</label>
            <input id="firstName" className={`mt-1.5 ${FIELD}`} value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </div>
          <div>
            <label className={LABEL} htmlFor="lastName">Last name</label>
            <input id="lastName" className={`mt-1.5 ${FIELD}`} value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="email">Email</label>
          <input id="email" className={`mt-1.5 ${FIELD} bg-cream/60 text-ink/60`} value={profile.email} readOnly />
          <p className="mt-1 text-xs text-ink/55">Your email is your sign-in and can&apos;t be changed here. Contact support to update it.</p>
        </div>

        <div className="mt-4">
          <label className={LABEL} htmlFor="phone">Phone (optional)</label>
          <input id="phone" className={`mt-1.5 ${FIELD}`} value={profile.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567" />
        </div>

        <label className="mt-4 flex items-start gap-3 rounded-2xl border border-tan bg-cream/50 p-4">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 accent-coral"
            checked={profile.smsMarketingOptIn}
            onChange={(e) => update("smsMarketingOptIn", e.target.checked)}
          />
          <span className="text-sm text-ink">
            <span className="font-bold text-teal">Text me occasional updates</span>
            <span className="block text-ink/70">New books, gentle reminders, and special offers. No spam — opt out anytime.</span>
          </span>
        </label>

        <div className="mt-5 flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
          {savedNote && <span className="text-sm font-extrabold text-teal">{savedNote}</span>}
          {error && <span className="text-sm font-bold text-coral">{error}</span>}
        </div>
      </form>

      {/* Security */}
      <div className="space-y-6">
        <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-2xl font-bold text-teal">Password & security</h2>
          <p className="mt-1 text-sm text-ink/70">
            {profile.passwordSetByCustomer
              ? "We'll email you a secure link to change your password."
              : "Finish setting up your account with a secure password link."}
          </p>
          <button type="button" onClick={sendReset} disabled={resetBusy} className="btn-ghost mt-4 w-full justify-center disabled:opacity-60">
            {resetBusy ? "Sending…" : profile.passwordSetByCustomer ? "Email me a reset link" : "Email me a setup link"}
          </button>
          {resetNote && <p className="mt-3 rounded-2xl border border-teal/20 bg-teal/5 p-3 text-sm text-teal">{resetNote}</p>}
        </section>

        <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
          <h2 className="font-serif text-2xl font-bold text-teal">Privacy</h2>
          <p className="mt-1 text-sm text-ink/70">Manage your data and consent preferences anytime.</p>
          <div className="mt-4 grid gap-2.5">
            <a href="/privacy" className="btn-ghost justify-center text-sm">Privacy policy</a>
            <a href="/contact" className="btn-ghost justify-center text-sm">Request my data</a>
          </div>
        </section>
      </div>
    </div>
  );
}
