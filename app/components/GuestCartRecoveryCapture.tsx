"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { getCartRecoveryContact, saveCartRecoveryContact, sendCartEvent } from "./cartTrackingClient";

type Props = {
  signedIn: boolean;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function GuestCartRecoveryCapture({ signedIn }: Props) {
  const { items } = useCart();
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const recovery = getCartRecoveryContact();
    if (recovery.email) setEmail(recovery.email);
    setMarketingConsent(recovery.marketingConsent);
  }, []);

  if (signedIn || !items.length) return null;

  function sync(nextEmail: string, nextConsent: boolean) {
    const cleanEmail = nextEmail.trim().toLowerCase();
    saveCartRecoveryContact(cleanEmail, nextConsent);
    setSaved(false);
    if (!cleanEmail || !nextConsent || !isValidEmail(cleanEmail)) return;
    sendCartEvent(items, "cart-email-captured", { email: cleanEmail, marketingConsent: true });
    setSaved(true);
  }

  return (
    <div className="mt-6 rounded-2xl border border-tan bg-white/55 p-5 text-left shadow-soft">
      <p className="font-serif text-xl text-teal">Want us to save this cart? ♥</p>
      <p className="mt-1 text-sm text-[#6b7d80]">Enter your email and we can send a gentle reminder if you leave before checking out.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-sm font-bold text-teal">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
            onBlur={() => sync(email, marketingConsent)}
            className="mt-1 w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-tan bg-white px-3 py-2 text-sm font-bold text-teal">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(event) => {
              const checked = event.target.checked;
              setMarketingConsent(checked);
              sync(email, checked);
            }}
          />
          Send cart reminders
        </label>
      </div>
      {saved ? <p className="mt-3 text-sm font-bold text-teal">Cart reminder saved.</p> : null}
    </div>
  );
}
