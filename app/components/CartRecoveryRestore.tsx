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
    const token = new URLSearchParams(window.location.search).get("recover") || "";
    if (!token) return;

    let active = true;
    async function restore() {
      try {
        const response = await fetch(`/api/cart/recover?token=${encodeURIComponent(token)}`, { credentials: "include" });
        const data = (await response.json()) as { cartToken?: string; items?: RestoredItem[]; error?: string };
        if (!response.ok || !data.cartToken || !Array.isArray(data.items) || !data.items.length) throw new Error(data.error || "We could not restore this cart.");
        if (!active) return;

        window.localStorage.setItem("bp_cart", JSON.stringify(data.items));
        window.localStorage.setItem("bp_cart_token", data.cartToken);
        window.dispatchEvent(new Event("bp-cart-updated"));
        sendCartEvent(data.items, "cart-updated");
        window.history.replaceState({}, "", "/cart");
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
