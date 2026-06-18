import crypto from "node:crypto";

type UnsubscribePayload = {
  email: string;
  expiresAt: number;
};

function tokenSecret() {
  return process.env.EMAIL_UNSUBSCRIBE_TOKEN_SECRET || process.env.CART_RECOVERY_TOKEN_SECRET || process.env["PAYLOAD_" + "SECRET"] || "";
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(encodedPayload: string) {
  const secret = tokenSecret();
  if (!secret) throw new Error("Email unsubscribe token secret is not configured.");
  return crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createUnsubscribeToken(email: string, expiresInDays = 180) {
  const payload: UnsubscribePayload = { email: email.trim().toLowerCase(), expiresAt: Date.now() + expiresInDays * 24 * 60 * 60 * 1000 };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  try {
    const expected = sign(encodedPayload);
    const provided = Buffer.from(signature);
    const actual = Buffer.from(expected);
    if (provided.length !== actual.length || !crypto.timingSafeEqual(provided, actual)) return null;
    const payload = JSON.parse(decode(encodedPayload)) as UnsubscribePayload;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) || !Number.isFinite(payload.expiresAt) || payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function unsubscribeUrl(token: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.PAYLOAD_PUBLIC_SERVER_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");
  return `${siteUrl}/api/email/unsubscribe?token=${encodeURIComponent(token)}`;
}
