"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type LibraryFormat = {
  format: string;
  label: string;
  quantity: number;
  orderNumbers: string[];
  status: string;
};

type LibraryBook = {
  title: string;
  bookId?: string | number | null;
  latestPurchaseAt?: string;
  orderNumbers?: string[];
  formats?: LibraryFormat[];
};

type PortalLibraryResponse = {
  books?: LibraryBook[];
  error?: string;
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function badgeClass(format: string) {
  if (format === "digital" || format === "audiobook") return "bg-coral/10 text-coral";
  return "bg-teal/10 text-teal";
}

function isDigitalAccess(format: string) {
  return format === "digital" || format === "audiobook";
}

function accessButtonLabel(format: string) {
  if (format === "digital") return "PDF / EPUB Access Coming Soon";
  if (format === "audiobook") return "Audiobook Access Coming Soon";
  if (format === "paperback") return "Paperback Order Recorded";
  if (format === "hardcover") return "Hardcover Order Recorded";
  return "Purchased";
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

        if (!response.ok) {
          throw new Error(data.error || "Please sign in to view your library.");
        }

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

  if (loading) {
    return <p className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-soft">Loading your library...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  if (!books.length) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">No purchased books found yet</h2>
        <p className="mt-3 text-ink">We did not find any purchased book formats linked to this customer account yet.</p>
        <Link href="/books" className="btn mt-6">Shop Books</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
      {books.map((book) => (
        <article key={`${book.bookId || book.title}`} className="rounded-[2rem] border border-tan bg-white/75 p-6 shadow-soft sm:p-8">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-coral">Purchased Book</p>
          <h2 className="mt-1 font-serif text-3xl font-bold leading-tight text-teal">{book.title}</h2>
          <p className="mt-2 text-sm text-ink/70">Latest purchase: {formatDate(book.latestPurchaseAt)}</p>

          <div className="mt-5 space-y-3">
            {(book.formats || []).map((format) => (
              <div key={format.format} className="rounded-2xl border border-tan bg-cream/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] ${badgeClass(format.format)}`}>{format.label}</span>
                  <span className="text-sm font-bold text-teal">Qty {format.quantity}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink">{format.status}</p>
                <div className="mt-4">
                  <button
                    type="button"
                    disabled
                    className={`w-full rounded-full px-5 py-3 text-sm font-extrabold transition ${isDigitalAccess(format.format) ? "bg-coral/20 text-coral" : "bg-teal/10 text-teal"}`}
                  >
                    {accessButtonLabel(format.format)}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-5 text-ink/65">Orders: {format.orderNumbers.join(", ")}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
