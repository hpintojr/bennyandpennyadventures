"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PortalSlotMeter from "./PortalSlotMeter";

type Overview = {
  user: { firstName?: string; lastName?: string; email?: string };
  slots: { total: number; used: number; gifts: number; remaining: number; perBook: { title: string; total: number; remaining: number }[] };
  counts: { books: number; orders: number; activeGifts: number; redeemedGifts: number; readyToRead: number };
  shipments: { inTransit: number; delivered: number };
  quickReads: { downloadId: string | number; bookTitle: string; format: string; label: string }[];
  recentOrders: {
    id: string | number;
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    createdAt?: string;
    itemsSummary?: string;
    fulfillment: string;
    hasTracking: boolean;
  }[];
};

function money(value?: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(value || 0);
}

function shortDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function fulfillmentTone(label: string) {
  if (label === "Delivered") return "bg-green text-teal";
  if (label === "Shipped") return "bg-coral/12 text-coral";
  if (label === "Needs attention") return "bg-coral/15 text-coral";
  return "bg-teal/10 text-teal";
}

function StatTile({ value, label, href }: { value: number | string; label: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-tan bg-white/70 p-4 transition hover:border-coral/50 hover:bg-white">
      <div className="font-serif text-3xl font-bold text-teal">{value}</div>
      <div className="mt-0.5 text-xs font-extrabold uppercase tracking-[0.08em] text-ink/60">{label}</div>
    </Link>
  );
}

export default function PortalDashboardClient() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/portal/overview", { credentials: "include" });
        const json = (await res.json()) as Overview & { error?: string };
        if (!res.ok) throw new Error(json.error || "Could not load your dashboard.");
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Could not load your dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function quickDownload(id: string | number) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/portal/downloads?download_id=${encodeURIComponent(String(id))}`, { credentials: "include" });
      const json = (await res.json()) as { url?: string; error?: string };
      if (res.ok && json.url) window.location.href = json.url;
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-tan bg-white/70 p-8 text-center font-bold text-teal shadow-sm">Loading your dashboard…</div>;
  }
  if (error || !data) {
    return <div className="rounded-3xl border border-tan bg-white/70 p-8 text-center text-ink shadow-sm">{error || "No data yet."}</div>;
  }

  const firstName = data.user.firstName || "there";
  const hasSlots = data.slots.total > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="small-label">Welcome back ♥</p>
        <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-teal sm:text-4xl">Hi {firstName}, here&apos;s your adventure shelf</h1>
        <p className="mt-2 max-w-2xl text-ink/80">Everything you&apos;ve bought, downloaded, gifted, and shipped — all in one gentle place.</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile value={data.counts.books} label="Books owned" href="/portal/library" />
        <StatTile value={data.counts.orders} label="Orders" href="/portal/orders" />
        <StatTile value={data.counts.activeGifts} label="Active gifts" href="/portal/gifts" />
        <StatTile value={data.shipments.inTransit} label="In transit" href="/portal/orders" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Ready to read */}
          <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold text-teal">Ready to read</h2>
              <Link href="/portal/library" className="text-sm font-extrabold text-coral hover:text-[#d95660]">My Library →</Link>
            </div>
            {data.quickReads.length ? (
              <ul className="mt-4 space-y-2.5">
                {data.quickReads.map((q) => (
                  <li key={`${q.downloadId}-${q.format}`} className="flex items-center justify-between gap-3 rounded-2xl border border-tan bg-cream/60 p-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-teal">{q.bookTitle}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink/55">{q.label}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => quickDownload(q.downloadId)}
                      disabled={busyId === q.downloadId}
                      className="shrink-0 rounded-full bg-coral px-4 py-2 text-sm font-extrabold text-white transition hover:bg-[#d95660] disabled:opacity-60"
                    >
                      {busyId === q.downloadId ? "Preparing…" : "Download"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-tan bg-cream/40 p-4 text-sm text-ink/70">
                Your downloadable books will appear here once a digital purchase is ready.
              </p>
            )}
          </section>

          {/* Recent orders */}
          <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold text-teal">Recent orders</h2>
              <Link href="/portal/orders" className="text-sm font-extrabold text-coral hover:text-[#d95660]">All orders →</Link>
            </div>
            {data.recentOrders.length ? (
              <ul className="mt-4 space-y-2.5">
                {data.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href="/portal/orders"
                      className="flex items-center justify-between gap-3 rounded-2xl border border-tan bg-cream/60 p-3.5 transition hover:border-coral/50 hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-teal">#{o.orderNumber}</p>
                        <p className="truncate text-xs text-ink/60">{shortDate(o.createdAt)} · {o.itemsSummary || "Order details"}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-bold text-teal">{money(o.total, o.currency)}</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${fulfillmentTone(o.fulfillment)}`}>{o.fulfillment}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-tan bg-cream/40 p-4 text-sm text-ink/70">
                No orders yet. <Link href="/books" className="font-extrabold text-coral">Shop the books →</Link>
              </p>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Reading slots */}
          <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
            <h2 className="font-serif text-2xl font-bold text-teal">Your reading slots</h2>
            <p className="mt-1 text-sm text-ink/70">Each book license includes 3 slots, shared across PDF/EPUB downloads and gifts.</p>
            {hasSlots ? (
              <>
                <div className="mt-4">
                  <PortalSlotMeter total={data.slots.total} used={data.slots.used} gifts={data.slots.gifts} remaining={data.slots.remaining} />
                </div>
                <p className="mt-3 text-sm font-bold text-teal">
                  {data.slots.remaining} of {data.slots.total} slots open across your library
                </p>
                {data.slots.perBook.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-tan pt-4">
                    {data.slots.perBook.map((b) => (
                      <li key={b.title} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate text-ink">{b.title}</span>
                        <span className="shrink-0 font-extrabold text-teal">{b.remaining}/{b.total}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/portal/gifts" className="btn mt-5 w-full">Gift a book</Link>
              </>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-tan bg-cream/40 p-4 text-sm text-ink/70">
                Reading slots appear after you buy a digital book.
              </p>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-3xl border border-tan bg-white/70 p-5 shadow-sm sm:p-6">
            <h2 className="font-serif text-2xl font-bold text-teal">Quick actions</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link href="/portal/addresses" className="btn-ghost justify-center text-sm">Addresses</Link>
              <Link href="/portal/account" className="btn-ghost justify-center text-sm">Account</Link>
              <Link href="/portal/help" className="btn-ghost justify-center text-sm">Get help</Link>
              <Link href="/books" className="btn-ghost justify-center text-sm">Shop books</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
