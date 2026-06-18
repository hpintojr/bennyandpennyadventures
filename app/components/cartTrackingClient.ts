import type { CartItem } from "./CartProvider";

const CART_TOKEN_KEY = "bp_cart_token";
const CART_RECOVERY_EMAIL_KEY = "bp_cart_recovery_email";
const CART_RECOVERY_CONSENT_KEY = "bp_cart_recovery_consent";

export function getCartToken(): string {
  if (typeof window === "undefined") return "";
  const existing = window.localStorage.getItem(CART_TOKEN_KEY);
  if (existing) return existing;
  const token = `cart_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CART_TOKEN_KEY, token);
  return token;
}

export function getCartRecoveryContact(): { email?: string; marketingConsent: boolean } {
  if (typeof window === "undefined") return { marketingConsent: false };
  const email = window.localStorage.getItem(CART_RECOVERY_EMAIL_KEY)?.trim() || undefined;
  const marketingConsent = window.localStorage.getItem(CART_RECOVERY_CONSENT_KEY) === "true";
  return { email, marketingConsent };
}

export function saveCartRecoveryContact(email: string, marketingConsent: boolean) {
  if (typeof window === "undefined") return;
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail) window.localStorage.setItem(CART_RECOVERY_EMAIL_KEY, cleanEmail);
  else window.localStorage.removeItem(CART_RECOVERY_EMAIL_KEY);
  window.localStorage.setItem(CART_RECOVERY_CONSENT_KEY, marketingConsent ? "true" : "false");
}

export function clearCartRecoveryContact() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CART_RECOVERY_EMAIL_KEY);
  window.localStorage.removeItem(CART_RECOVERY_CONSENT_KEY);
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
