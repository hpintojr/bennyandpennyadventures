"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/books";
import { useCart } from "./CartProvider";
import ImageSlot from "./ImageSlot";

export default function CartPageClient() {
  const { items, subtotal, setQty, removeItem, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="page-wrap pb-16 pt-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">Your Cart <span className="text-coral">♥</span></h1>
          <p className="mx-auto mt-4 max-w-xl text-ink">Your cart is empty. Start with the book catalog and add the formats you want to test.</p>
          <Link href="/books" className="btn mt-7">Browse the Books ♥</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap pb-16 pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">Your Cart <span className="text-coral">♥</span></h1>
          <p className="mt-2 text-ink">Review your selected book formats. Stripe checkout gets wired next.</p>
        </div>
        <button type="button" onClick={clearCart} className="btn-ghost self-start">Clear cart</button>
      </div>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid gap-4 rounded-2xl border border-tan bg-white/55 p-4 sm:grid-cols-[72px_1fr_auto_auto] sm:items-center">
            <ImageSlot src={item.coverImage} alt={`${item.title} cover`} label="Cover" note={item.coverImage} className="aspect-[3/4] w-[72px] rounded-xl" />
            <div>
              <Link href={`/books/${item.slug}`} className="font-serif text-xl text-teal hover:text-coral">{item.title}</Link>
              <p className="text-sm font-extrabold text-coral">{item.format} · {formatMoney(item.price)}</p>
            </div>
            <div className="flex items-center overflow-hidden rounded-full border border-tan bg-white sm:justify-self-end">
              <button type="button" className="h-9 w-9 text-lg" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease quantity">−</button>
              <span className="min-w-8 text-center font-extrabold">{item.qty}</span>
              <button type="button" className="h-9 w-9 text-lg" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase quantity">+</button>
            </div>
            <div className="text-left sm:min-w-24 sm:text-right">
              <p className="font-serif text-xl text-teal">{formatMoney(item.price * item.qty)}</p>
              <button type="button" className="text-xs font-extrabold text-[#9C7E5E] hover:text-coral" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-end gap-4 border-t border-tan pt-6 text-right">
        <p className="text-2xl text-teal">Subtotal: <span className="font-serif font-semibold">{formatMoney(subtotal)}</span></p>
        <button type="button" disabled className="btn cursor-not-allowed opacity-60">Proceed to Checkout — Stripe coming soon</button>
        <p className="max-w-xl text-sm text-[#6b7d80]">This deploy package includes a working browser cart for testing. Stripe Checkout and Cloudflare R2 signed ebook delivery are left as the next integration layer.</p>
      </div>
    </div>
  );
}
