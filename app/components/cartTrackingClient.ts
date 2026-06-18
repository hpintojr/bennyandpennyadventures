import type { CartItem } from "./CartProvider";

const CART_TOKEN_KEY = "bp_cart_token";

export function getCartToken(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(CART_TOKEN_KEY);
  if (existing) return existing;
  const token = `cart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CART_TOKEN_KEY, token);
  return token;
}

export function sendCartEvent(items: CartItem[], event: "cart-updated" | "cart-cleared" | "cart-email-captured", extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const cartToken = getCartToken();
  if (!cartToken) return;
  window.fetch("/api/cart/events", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      cartToken,
      items: items.map((item) => ({
        slug: item.slug,
        title: item.title,
        format: item.format,
        qty: item.qty,
        unitPrice: item.price,
        coverImage: item.coverImage
      })),
      ...extra
    })
  }).catch(() => null);
}
