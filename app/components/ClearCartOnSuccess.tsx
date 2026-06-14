"use client";

import { useEffect } from "react";

const STORAGE_KEY = "bp_cart";

export default function ClearCartOnSuccess({ shouldClear }: { shouldClear: boolean }) {
  useEffect(() => {
    if (!shouldClear) return;

    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("bp-cart-updated"));
  }, [shouldClear]);

  return null;
}
