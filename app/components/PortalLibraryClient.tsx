"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PortalSlotMeter from "./PortalSlotMeter";

type ReadableSummary = { total: number; used: number; gifts: number; remaining: number };

type DownloadOption = {
  format: string;
  label: string;
  downloadId?: string | number | null;
  downloadable: boolean;
  status: string;
};

type LibraryFormat = {
  format: string;
  label: string;
  quantity: number;
  orderNumbers: string[];
  status: string;
  downloadId?: string | number | null;
  downloadable?: boolean;
  downloadOptions?: DownloadOption[];
};
type LibraryBook = { title: string; bookId?: string | number | null; latestPurchaseAt?: string; readable?: ReadableSummary | null; formats?: LibraryFormat[] };
type PortalLibraryResponse = { books?: LibraryBook[]; error?: string };

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function badgeClass(format: string) {
  return format === "digital" || format === "audiobook" ? "bg-coral/10 text-coral" : "bg-teal/10 text-teal";
}

function isDigital(format: string) {
  return format === "digital" || format === "audiobook";
}

function fallbackButtonLabel(format: string) {
  if (format === "digital") return "Digital files pending";
  if (format === "audiobook") return "Audio file pending";
  if (format === "paperback") return "Paperback recorded";
  if (format === "hardcover") return "Hardcover recorded";
  return "Recorded";
}

function summary(book: LibraryBook) {
  const formats = book.formats || [];
  if (!formats.length) return "No formats listed";
  return formats.map((format) => `${format.label} x${format.quantity}`).join(" · ");
}

function DownloadButton({ option }: { option: DownloadOption }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!option.downloadId || !option.downloadable) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/portal/downloads?download_id=${encodeURIComponent(String(option.downloadId))}`, {
        credentials: "include"
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) throw new Error(data.error || "Could not prepare your download.");
      window.location.href = data.url;
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "Could not prepare your download.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy || !option.downloadable}
        className="mt-3 w-full rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white transition hover:bg-coral/90 disabled:cursor-not-allowed disabled:bg-coral/20 disabled:text-coral disabled:opacity-100"
      >
        {busy ? "Preparing…" : option.downloadable ? `Download ${option.label}` : `${option.label} unavailable`}
      </button>
      <p className="mt-1 text-xs font-bold text-ink/65">{option.status}</p>
      {error && <p className="mt-2 text-xs font-bold text-coral">{error}</p>}
    </div>
  );
}

function FormatCard({ format }: { format: LibraryFormat }) {
  const options = format.downloadOptions || [];
  const canDownload = Boolean(format.downloadable && format.downloadId);

  return (
    <div className="min-w-0 rounded-2xl border border-tan bg-cream/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] sm:text-xs ${badgeClass(format.format)}`}>{format.label}</span>
        <span className="text-sm font-bold text-teal">Qty {format.quantity}</span>
      </div>
      <p className="mt-3 break-words text-sm leading-6 text-ink">{format.status}</p>

      {options.length ? (
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {options.map((option) => <DownloadButton key={`${option.format}-${option.downloadId || "pending"}`} option={option} />)}
        </div>
      ) : canDownload && format.downloadId ? (
        <DownloadButton option={{ format: format.format, label: format.label, downloadId: format.downloadId, downloadable: true, status: format.status }} />
      ) : (
        <button
          type="button"
          disabled
          className={`mt-4 w-full rounded-full px-5 py-3 text-sm font-extrabold transition ${isDigital(format.format) ? "bg-coral/20 text-coral" : "bg-teal/10 text-teal"}`}
        >
          {fallbackButtonLabel(format.format)}
        </button>
      )}

      <p className="mt-2 break-words text-xs leading-5 text-ink/65">Orders: {format.orderNumbers.join(", ")}</p>
    </div>
  );
}

export default function PortalLibraryClient() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadLibrary() {
      try {
        const response = await fetch("/api/portal/library", { credentials: "include" });
        const data = (await response.json()) as PortalLibraryResponse;
        if (!response.ok) throw new Error(data.error || "Please sign in to view your library.");
        if (active) setBooks(data.books || []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load your library.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadLibrary();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-soft">Loading your library...</p>;

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center shadow-soft sm:p-8">
        <h2 className="font-serif text-3xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  if (!books.length) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center shadow-soft sm:p-8">
        <h2 className="font-serif text-3xl font-bold text-teal">No purchased books found yet</h2>
        <p className="mt-3 text-ink">We did not find any purchased book formats linked to this customer account yet.</p>
        <Link href="/books" className="btn mt-6">Shop Books</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-3">
      {books.map((book, index) => (
        <details key={`${book.bookId || book.title}`} open={index === 0} className="group overflow-hidden rounded-[1.5rem] border border-tan bg-white/75 shadow-soft">
          <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-4 transition hover:bg-cream/60 sm:px-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">Purchased Book</p>
              <h2 className="mt-1 break-words font-serif text-2xl font-bold leading-tight text-teal">{book.title}</h2>
              <p className="mt-1 break-words text-sm leading-6 text-ink/70">{summary(book)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4">
              <span className="text-sm text-ink/65">Latest: {formatDate(book.latestPurchaseAt)}</span>
              <span className="text-sm font-extrabold text-coral group-open:hidden">View</span>
              <span className="hidden text-sm font-extrabold text-coral group-open:inline">Hide</span>
            </div>
          </summary>

          <div className="border-t border-tan px-4 pb-5 pt-4 sm:px-5">
            {book.readable && (
              <div className="mb-4 rounded-2xl border border-tan bg-cream/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-teal">Reading slots</p>
                  <p className="text-sm font-bold text-ink/70">{book.readable.remaining} of {book.readable.total} open</p>
                </div>
                <div className="mt-3">
                  <PortalSlotMeter total={book.readable.total} used={book.readable.used} gifts={book.readable.gifts} remaining={book.readable.remaining} />
                </div>
                <p className="mt-3 text-xs text-ink/60">Slots are shared across PDF/EPUB downloads and gifts. <Link href="/portal/gifts" className="font-extrabold text-coral">Gift this book →</Link></p>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {(book.formats || []).map((format) => (
                <FormatCard key={format.format} format={format} />
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
