"use client";

import { useEffect } from "react";

const STORAGE_KEY = "bp_cart";

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
    window.dispatchEvent(new Event("bp-cart-updated"));
  }, [shouldClear]);

  return null;
}
