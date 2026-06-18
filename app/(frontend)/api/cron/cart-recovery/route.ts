import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { upsertSubscriber } from "@/lib/email";
import { sendCartRecoveryEmail } from "@/lib/cartRecoveryEmail";
import { cartRecoveryUrl, createCartRecoveryToken } from "@/lib/cartRecoveryTokens";
import { createUnsubscribeToken, unsubscribeUrl } from "@/lib/emailUnsubscribeTokens";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };
type CartItem = { title?: unknown; format?: unknown; qty?: unknown; unitPrice?: unknown };

const ACTIVE_CART_ABANDON_AFTER_HOURS = Number(process.env.CART_ACTIVE_ABANDON_AFTER_HOURS || 4);
const CHECKOUT_ABANDON_AFTER_HOURS = Number(process.env.CART_CHECKOUT_ABANDON_AFTER_HOURS || 1);
const SECOND_REMINDER_AFTER_HOURS = Number(process.env.CART_SECOND_REMINDER_AFTER_HOURS || 24);
const RECOVERY_EMAILS_ENABLED = process.env.CART_RECOVERY_SEND_ENABLED === "true";

function validHours(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function dateHoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function validEmail(value: unknown) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? value.trim().toLowerCase() : null;
}

function bool(value: unknown) {
  return value === true || value === "true" || value === 1;
}

function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function cartItems(value: unknown): Array<{ title: string; format?: string; qty?: number }> {
  const raw = Array.isArray(value) ? value as CartItem[] : [];
  return raw.map((item) => ({
    title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "Benny & Penny book",
    format: typeof item.format === "string" && item.format.trim() ? item.format.trim() : undefined,
    qty: Math.max(1, Math.floor(number(item.qty, 1)))
  }));
}

async function payloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

async function findSubscriber(payload: Awaited<ReturnType<typeof payloadClient>>, email: string) {
  const result = (await payload.find({
    collection: "subscribers",
    overrideAccess: true,
    limit: 1,
    where: { email: { equals: email } }
  })) as PayloadFindResult;
  return result.docs?.[0] || null;
}

async function ensureSubscriber(payload: Awaited<ReturnType<typeof payloadClient>>, email: string) {
  const current = await findSubscriber(payload, email);
  if (current) return current;
  return (await payload.create({
    collection: "subscribers",
    overrideAccess: true,
    data: { email, marketingOptIn: true, source: "cart-recovery" }
  })) as PayloadDoc;
}

function subscriberSuppressed(subscriber: PayloadDoc | null) {
  if (!subscriber) return false;
  return subscriber.marketingOptIn === false || Boolean(subscriber.unsubscribedAt);
}

async function syncAbandonedCartToSequenzy(cart: PayloadDoc, originalStatus: string) {
  const email = validEmail(cart.email);
  if (!email) return;
  const tags = ["cart-abandoned", "ecommerce.in_cart"];
  if (originalStatus === "checkout-started") tags.push("ecommerce.in_checkout");
  if (typeof cart.couponCode === "string" && cart.couponCode) tags.push("coupon-user");
  if ((typeof cart.bpgCode === "string" && cart.bpgCode) || (typeof cart.giftCode === "string" && /^BPG/i.test(cart.giftCode))) tags.push("bpg-gift-code-user");
  await upsertSubscriber({
    email,
    tags,
    customAttributes: {
      acquiredVia: "abandoned-cart",
      cartId: cart.id,
      cartToken: cart.cartToken,
      cartStatus: "abandoned",
      cartRecoveryEligible: bool(cart.recoveryEligible),
      cartSubtotal: number(cart.subtotal),
      cartItemCount: number(cart.itemCount),
      cartItems: typeof cart.itemsSummary === "string" ? cart.itemsSummary : undefined,
      abandonedAt: cart.abandonedAt
    }
  }).catch(() => null);
}

async function deliverReminder(payload: Awaited<ReturnType<typeof payloadClient>>, cart: PayloadDoc, kind: "first" | "second") {
  const email = validEmail(cart.email);
  if (!email || !bool(cart.marketingConsent) || !bool(cart.recoveryEligible) || cart.status !== "abandoned") return false;

  const subscriber = await findSubscriber(payload, email);
  if (subscriberSuppressed(subscriber)) {
    await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: { recoveryEligible: false, recoveryState: "suppressed", recoveryEmailError: "subscriber-unsubscribed" }
    });
    return false;
  }

  if (!RECOVERY_EMAILS_ENABLED) return false;

  const recoveryUrl = cartRecoveryUrl(createCartRecoveryToken(cart.id));
  const stopUrl = unsubscribeUrl(createUnsubscribeToken(email));
  const result = await sendCartRecoveryEmail({
    to: email,
    recoveryUrl,
    items: cartItems(cart.items),
    subtotal: number(cart.subtotal),
    kind,
    unsubscribeUrl: stopUrl
  });

  const now = new Date().toISOString();
  const data: Record<string, unknown> = {
    lastReminderSentAt: now,
    recoveryEmailError: result.ok ? undefined : result.error || "send-failed"
  };
  if (kind === "first") {
    data.firstReminderSentAt = now;
    data.recoveryState = result.ok ? "reminder-1-sent" : "eligible";
  } else {
    data.secondReminderSentAt = now;
    data.recoveryState = result.ok ? "reminder-2-sent" : "reminder-1-sent";
  }

  await payload.update({ collection: "abandoned-carts", overrideAccess: true, id: cart.id, data });
  return result.ok;
}

async function markOverdueCartsAbandoned(payload: Awaited<ReturnType<typeof payloadClient>>) {
  const activeCutoff = dateHoursAgo(validHours(ACTIVE_CART_ABANDON_AFTER_HOURS, 4));
  const checkoutCutoff = dateHoursAgo(validHours(CHECKOUT_ABANDON_AFTER_HOURS, 1));
  const active = (await payload.find({
    collection: "abandoned-carts",
    overrideAccess: true,
    depth: 0,
    limit: 200,
    where: { and: [{ status: { equals: "active-cart" } }, { lastActivityAt: { less_than: activeCutoff } }] }
  })) as PayloadFindResult;
  const checkout = (await payload.find({
    collection: "abandoned-carts",
    overrideAccess: true,
    depth: 0,
    limit: 200,
    where: { and: [{ status: { equals: "checkout-started" } }, { checkoutStartedAt: { less_than: checkoutCutoff } }] }
  })) as PayloadFindResult;

  const carts = [...(active.docs || []), ...(checkout.docs || [])];
  let marked = 0;
  let firstSent = 0;

  for (const cart of carts) {
    const originalStatus = typeof cart.status === "string" ? cart.status : "active-cart";
    const email = validEmail(cart.email);
    const subscriber = email ? await ensureSubscriber(payload, email) : null;
    const eligible = Boolean(email && bool(cart.marketingConsent) && !subscriberSuppressed(subscriber));
    const now = new Date().toISOString();

    const updated = (await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: {
        status: "abandoned",
        abandonedAt: cart.abandonedAt || now,
        recoveryEligible: eligible,
        recoveryState: eligible ? "eligible" : subscriberSuppressed(subscriber) ? "suppressed" : "not-eligible",
        lastActivityAt: now,
        source: "cart-recovery-cron"
      }
    })) as PayloadDoc;
    marked += 1;

    if (eligible) {
      await syncAbandonedCartToSequenzy(updated, originalStatus);
      if (await deliverReminder(payload, updated, "first")) firstSent += 1;
    }
  }

  return { marked, firstSent };
}

async function sendSecondReminders(payload: Awaited<ReturnType<typeof payloadClient>>) {
  const cutoff = dateHoursAgo(validHours(SECOND_REMINDER_AFTER_HOURS, 24));
  const result = (await payload.find({
    collection: "abandoned-carts",
    overrideAccess: true,
    depth: 0,
    limit: 200,
    where: {
      and: [
        { status: { equals: "abandoned" } },
        { recoveryEligible: { equals: true } },
        { recoveryState: { equals: "reminder-1-sent" } },
        { firstReminderSentAt: { less_than: cutoff } }
      ]
    }
  })) as PayloadFindResult;

  let sent = 0;
  for (const cart of result.docs || []) {
    if (await deliverReminder(payload, cart, "second")) sent += 1;
  }
  return sent;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await payloadClient();
    const abandonment = await markOverdueCartsAbandoned(payload);
    const secondRemindersSent = await sendSecondReminders(payload);
    return NextResponse.json({
      ok: true,
      emailsEnabled: RECOVERY_EMAILS_ENABLED,
      activeCartHours: validHours(ACTIVE_CART_ABANDON_AFTER_HOURS, 4),
      checkoutStartedHours: validHours(CHECKOUT_ABANDON_AFTER_HOURS, 1),
      markedAbandoned: abandonment.marked,
      firstRemindersSent: abandonment.firstSent,
      secondRemindersSent
    });
  } catch (error) {
    console.error("Cart recovery cron failed", error);
    return NextResponse.json({ error: "Cart recovery cron failed." }, { status: 500 });
  }
}
