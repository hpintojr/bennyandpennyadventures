"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/books";
import { useCart } from "./CartProvider";
import { getCartToken } from "./cartTrackingClient";
import ImageSlot from "./ImageSlot";

type SavedAddress = {
  id: string | number;
  label?: string;
  addressType?: string;
  fullName?: string;
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

function addressOptionLabel(address: SavedAddress) {
  const name = address.label || address.fullName || "Saved address";
  const place = [address.street1, address.city, address.state].filter(Boolean).join(", ");
  return place ? `${name} — ${place}` : name;
}

export default function CartPageClient() {
  const { items, subtotal, setQty, removeItem, clearCart } = useCart();
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading" | "error">("idle");
  const [checkoutError, setCheckoutError] = useState("");

  const [signedIn, setSignedIn] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [shippingId, setShippingId] = useState("");
  const [billingId, setBillingId] = useState("");

  const requiresShipping = useMemo(
    () => items.some((item) => /paperback|hardcover/i.test(item.format || "")),
    [items]
  );

  useEffect(() => {
    let active = true;
    async function loadAccount() {
      try {
        const meResponse = await fetch("/api/portal/me", { credentials: "include" });
        const me = (await meResponse.json()) as { authenticated?: boolean };
        if (!active || !me.authenticated) return;
        setSignedIn(true);

        const addrResponse = await fetch("/api/portal/addresses", { credentials: "include" });
        if (!addrResponse.ok) return;
        const data = (await addrResponse.json()) as { addresses?: SavedAddress[] };
        const saved = data.addresses || [];
        if (!active) return;
        setAddresses(saved);

        const defaultBilling = saved.find((a) => a.isDefaultBilling) || saved.find((a) => a.addressType === "billing" || a.addressType === "both");
        const defaultShipping = saved.find((a) => a.isDefaultShipping) || saved.find((a) => a.addressType === "shipping" || a.addressType === "both");
        if (defaultBilling) setBillingId(String(defaultBilling.id));
        if (defaultShipping) setShippingId(String(defaultShipping.id));
      } catch {
        // Stay in guest mode if anything fails.
      }
    }
    loadAccount();
    return () => {
      active = false;
    };
  }, []);

  async function startCheckout() {
    setCheckoutState("loading");
    setCheckoutError("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartToken: getCartToken(),
          items: items.map((item) => ({
            slug: item.slug,
            format: item.format,
            qty: item.qty
          })),
          billingAddressId: billingId || undefined,
          shippingAddressId: requiresShipping ? shippingId || undefined : undefined
        })
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Stripe checkout is not ready yet.");
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutState("error");
      setCheckoutError(error instanceof Error ? error.message : "Stripe checkout is not ready yet.");
    }
  }

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

  const showAddressPicker = signedIn && addresses.length > 0;

  return (
    <div className="page-wrap pb-16 pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">Your Cart <span className="text-coral">♥</span></h1>
          <p className="mt-2 text-ink">Review your selected book formats, then continue to Stripe sandbox checkout.</p>
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

      {showAddressPicker && (
        <div className="mt-8 rounded-2xl border border-tan bg-white/55 p-5">
          <p className="font-serif text-xl text-teal">Use a saved address ♥</p>
          <p className="mt-1 text-sm text-[#6b7d80]">We&apos;ll prefill these on the Stripe checkout page. You can still edit them there.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-teal/80">Billing address</label>
              <select className="w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink" value={billingId} onChange={(e) => setBillingId(e.target.value)}>
                <option value="">Enter a new one at checkout</option>
                {addresses.map((address) => (
                  <option key={`b-${address.id}`} value={String(address.id)}>{addressOptionLabel(address)}</option>
                ))}
              </select>
            </div>
            {requiresShipping && (
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-teal/80">Shipping address</label>
                <select className="w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink" value={shippingId} onChange={(e) => setShippingId(e.target.value)}>
                  <option value="">Enter a new one at checkout</option>
                  {addresses.map((address) => (
                    <option key={`s-${address.id}`} value={String(address.id)}>{addressOptionLabel(address)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {!signedIn && (
        <p className="mt-6 text-right text-sm text-[#6b7d80]">
          Have an account? <Link href="/portal/login" className="font-bold text-teal underline decoration-coral/40 underline-offset-4 hover:text-coral">Sign in</Link> to use a saved address.
        </p>
      )}

      <div className="mt-8 flex flex-col items-end gap-4 border-t border-tan pt-6 text-right">
        <p className="text-2xl text-teal">Subtotal: <span className="font-serif font-semibold">{formatMoney(subtotal)}</span></p>
        <button type="button" onClick={startCheckout} disabled={checkoutState === "loading"} className="btn disabled:cursor-not-allowed disabled:opacity-70">
          {checkoutState === "loading" ? "Opening Stripe Checkout…" : "Proceed to Stripe Checkout ♥"}
        </button>
        {checkoutState === "error" ? <p className="max-w-xl text-sm font-bold text-coral">{checkoutError}</p> : null}
        <p className="max-w-xl text-sm text-[#6b7d80]">Stripe sandbox checkout uses test keys only. Paid files stay private in Cloudflare R2 and will deliver through signed links after webhook fulfillment is completed.</p>
      </div>
    </div>
  );
}
