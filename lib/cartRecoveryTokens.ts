import crypto from "node:crypto";

type CartRecoveryPayload = {
  cartId: string | number;
  expiresAt: number;
};

function tokenSecret() {
  return process.env.CART_RECOVERY_TOKEN_SECRET || process.env["PAYLOAD_" + "SECRET"] || "";
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(encodedPayload: string) {
  const secret = tokenSecret();
  if (!secret) throw new Error("Cart recovery token secret is not configured.");
  return crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createCartRecoveryToken(cartId: string | number, expiresInDays = 14) {
  const payload: CartRecoveryPayload = {
    cartId,
    expiresAt: Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyCartRecoveryToken(token: string): CartRecoveryPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  try {
    const expected = sign(encodedPayload);
    const provided = Buffer.from(signature);
    const actual = Buffer.from(expected);
    if (provided.length !== actual.length || !crypto.timingSafeEqual(provided, actual)) return null;

    const payload = JSON.parse(decode(encodedPayload)) as CartRecoveryPayload;
    if (!payload.cartId || !Number.isFinite(payload.expiresAt) || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function cartRecoveryUrl(token: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");
  return `${siteUrl}/cart#recover=${encodeURIComponent(token)}`;
}
