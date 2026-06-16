import { NextResponse } from "next/server";

type RateEntry = {
  count: number;
  resetAt: number;
};

type BotProtectionOptions = {
  body: Record<string, unknown>;
  request: Request;
  routeName: string;
  maxRequests?: number;
  windowMs?: number;
};

const rateStore = new Map<string, RateEntry>();
const DEFAULT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 8;

export function getRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function hasHoneypotValue(body: Record<string, unknown>): boolean {
  const honeypotFields = ["website", "companyWebsite", "middleName", "nickname", "faxNumber"];
  return honeypotFields.some((field) => {
    const value = body[field];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  });
}

function isRateLimited(routeName: string, ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `${routeName}:${ip}`;
  const current = rateStore.get(key);

  if (!current || current.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  current.count += 1;
  rateStore.set(key, current);
  return current.count > maxRequests;
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (ip && ip !== "unknown") form.append("remoteip", ip);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const data = (await response.json().catch(() => null)) as { success?: boolean } | null;
    return Boolean(response.ok && data?.success);
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}

export async function checkBotProtection({
  body,
  request,
  routeName,
  maxRequests = DEFAULT_MAX_REQUESTS,
  windowMs = DEFAULT_WINDOW_MS
}: BotProtectionOptions): Promise<NextResponse | null> {
  const ip = getRequestIp(request);

  if (hasHoneypotValue(body)) {
    console.warn(`Blocked ${routeName} honeypot submission`, { ip });
    return NextResponse.json({ error: "Unable to submit this form." }, { status: 400 });
  }

  if (isRateLimited(routeName, ip, maxRequests, windowMs)) {
    console.warn(`Rate limited ${routeName} submission`, { ip });
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  const turnstileToken = String(body.turnstileToken || body.cfTurnstileToken || "").trim();
  const turnstileOk = await verifyTurnstile(turnstileToken, ip);

  if (!turnstileOk) {
    return NextResponse.json({ error: "Please complete the security check and try again." }, { status: 400 });
  }

  return null;
}
