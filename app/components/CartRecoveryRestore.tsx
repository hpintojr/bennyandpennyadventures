"use client";

import { useEffect, useState } from "react";
import { sendCartEvent } from "./cartTrackingClient";

type RestoredItem = {
  id: string;
  slug: string;
  title: string;
  format: string;
  price: number;
  qty: number;
  coverImage: string;
};

export default function CartRecoveryRestore() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("recover") || "";
    const legacyToken = new URLSearchParams(window.location.search).get("recover") || "";
    const token = fragmentToken || legacyToken;
    if (!token) return;

    // Remove the token before any further requests so it cannot appear in
    // referrers, copied URLs, browser history, or server request logs.
    window.history.replaceState({}, "", "/cart");

    let active = true;
    async function restore() {
      try {
        const response = await fetch("/api/cart/recover", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const data = (await response.json()) as { cartToken?: string; items?: RestoredItem[]; error?: string };
        if (!response.ok || !data.cartToken || !Array.isArray(data.items) || !data.items.length) throw new Error(data.error || "We could not restore this cart.");
        if (!active) return;

        window.localStorage.setItem("bp_cart", JSON.stringify(data.items));
        window.localStorage.setItem("bp_cart_token", data.cartToken);
        window.dispatchEvent(new Event("bp-cart-updated"));
        sendCartEvent(data.items, "cart-updated");
        setMessage("Your saved cart is ready to review. ♥");
      } catch (error) {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "We could not restore this cart.");
      }
    }

    void restore();
    return () => {
      active = false;
    };
  }, []);

  if (!message) return null;
  return <p className="mx-auto mt-4 max-w-xl rounded-xl border border-tan bg-white/70 px-4 py-3 text-center text-sm font-bold text-teal">{message}</p>;
}
