"use client";

import { useMemo, useState } from "react";
import { Book, bookFormats, formatMoney } from "@/lib/books";
import { useCart } from "./CartProvider";

type ProductActionsProps = {
  book: Book;
};

export default function ProductActions({ book }: ProductActionsProps) {
  const [formatIndex, setFormatIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const { addItem } = useCart();

  const selected = bookFormats[formatIndex];
  const itemId = useMemo(() => `${book.slug}-${selected.shortLabel.toLowerCase()}`, [book.slug, selected.shortLabel]);

  function addToCart() {
    addItem(
      {
        id: itemId,
        slug: book.slug,
        title: book.title,
        format: selected.label,
        price: selected.price,
        coverImage: book.coverImage
      },
      qty
    );
    setToast(true);
    window.setTimeout(() => setToast(false), 1800);
  }

  return (
    <div>
      <div className="mb-3 text-sm font-extrabold text-teal">Choose your format:</div>
      <div className="mb-6 flex flex-col gap-3">
        {bookFormats.map((format, index) => {
          const active = index === formatIndex;
          return (
            <button
              key={format.label}
              type="button"
              onClick={() => setFormatIndex(index)}
              className={`flex items-center justify-between gap-4 rounded-2xl border bg-white px-5 py-4 text-left transition hover:border-coral ${active ? "border-coral bg-blush" : "border-tan"}`}
            >
              <span className="flex items-center gap-3">
                <span className={`h-[18px] w-[18px] rounded-full border-2 ${active ? "border-coral bg-coral shadow-[inset_0_0_0_3px_white]" : "border-tan"}`} />
                <span>
                  <span className="font-extrabold text-teal">{format.label}</span>
                  <br />
                  <span className="text-xs font-semibold text-[#6b7d80]">{format.description}</span>
                </span>
              </span>
              <span className="font-serif text-xl text-teal">{formatMoney(format.price)}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <div className="font-serif text-3xl text-teal">{formatMoney(selected.price)}</div>
        <div className="flex items-center overflow-hidden rounded-full border border-tan bg-white">
          <button type="button" className="h-10 w-10 text-xl text-teal" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
          <span className="min-w-8 text-center font-extrabold text-teal">{qty}</span>
          <button type="button" className="h-10 w-10 text-xl text-teal" onClick={() => setQty((value) => value + 1)} aria-label="Increase quantity">+</button>
        </div>
        <button type="button" className="btn text-lg" onClick={addToCart}>Add to Cart ♥</button>
      </div>

      <div className="mt-6 rounded-2xl border border-tan bg-white/60 p-4 text-sm text-ink">
        <p className="font-extrabold text-teal">Digital and audio file test paths</p>
        <p className="mt-1">PDF: <code className="rounded bg-white px-1">{book.pdfPath}</code></p>
        <p>EPUB: <code className="rounded bg-white px-1">{book.epubPath}</code></p>
        <p>Audiobook: <code className="rounded bg-white px-1">{book.audioPath}</code></p>
        <p className="mt-2 text-xs text-[#6b7d80]">Drop matching files into <code>public/downloads/</code> for local link testing. For launch, keep paid ebooks and audiobook files private in Cloudflare R2 and deliver signed links after Stripe checkout.</p>
      </div>

      <div className={`fixed bottom-6 left-1/2 z-50 rounded-full bg-teal px-6 py-3 font-bold text-white shadow-xl transition ${toast ? "translate-x-[-50%] translate-y-0 opacity-100" : "pointer-events-none translate-x-[-50%] translate-y-5 opacity-0"}`}>
        Added to cart ♥
      </div>
    </div>
  );
}
