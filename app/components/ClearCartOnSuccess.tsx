"use client";

import { useEffect } from "react";

const STORAGE_KEY = "bp_cart";
const CART_TOKEN_KEY = "bp_cart_token";
const CART_RECOVERY_EMAIL_KEY = "bp_cart_recovery_email";
const CART_RECOVERY_CONSENT_KEY = "bp_cart_recovery_consent";

export default function ClearCartOnSuccess({ shouldClear }: { shouldClear: boolean }) {
  useEffect(() => {
    if (!shouldClear) return;

    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (sessionId) {
      window.fetch("/api/cart/convert", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      }).catch(() => null);
    }

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(CART_TOKEN_KEY);
    window.localStorage.removeItem(CART_RECOVERY_EMAIL_KEY);
    window.localStorage.removeItem(CART_RECOVERY_CONSENT_KEY);
    window.dispatchEvent(new Event("bp-cart-updated"));
  }, [shouldClear]);

  return null;
}
