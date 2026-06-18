import { getPayload } from "payload";
import { upsertSubscriber } from "@/lib/email";
import { sendCartRecoveryEmail } from "@/lib/cartRecoveryEmail";
import { cartRecoveryUrl, createCartRecoveryToken } from "@/lib/cartRecoveryTokens";
import { createUnsubscribeToken, unsubscribeUrl } from "@/lib/emailUnsubscribeTokens";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };
type CartItem = { title?: unknown; format?: unknown; qty?: unknown };
type PayloadClient = Awaited<ReturnType<typeof getPayloadClient>>;

export type CartRecoveryRunOptions = {
  forceCartId?: string | number;
  sendReminders?: boolean;
  source?: string;
};

export type CartRecoveryRunResult = {
  emailsEnabled: boolean;
  activeCartHours: number;
  checkoutStartedHours: number;
  markedAbandoned: number;
  firstRemindersSent: number;
  secondRemindersSent: number;
  sequenzySyncsAttempted: number;
  forcedCartId?: string | number;
};

export type CartRecoveryReminderResult = {
  ok: boolean;
  sent: boolean;
  reason?: string;
  cartId?: string | number;
};

function configuredHours(name: string, fallback: number) {
  const value = Number(process.env[name] || fallback);
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
  const raw = Array.isArray(value) ? (value as CartItem[]) : [];
  return raw.map((item) => ({
    title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "Benny & Penny book",
    format: typeof item.format === "string" && item.format.trim() ? item.format.trim() : undefined,
    qty: Math.max(1, Math.floor(number(item.qty, 1)))
  }));
}

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

async function findSubscriber(payload: PayloadClient, email: string) {
  const result = (await payload.find({
    collection: "subscribers",
    overrideAccess: true,
    limit: 1,
    where: { email: { equals: email } }
  })) as PayloadFindResult;
  return result.docs?.[0] || null;
}

async function ensureSubscriber(payload: PayloadClient, email: string) {
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

function isClosedCart(cart: PayloadDoc) {
  return ["converted", "dismissed", "recovered"].includes(typeof cart.status === "string" ? cart.status : "");
}

function emailDeliveryEnabled() {
  return process.env.CART_RECOVERY_SEND_ENABLED === "true";
}

async function syncAbandonedCartToSequenzy(cart: PayloadDoc, originalStatus: string) {
  const email = validEmail(cart.email);
  if (!email) return false;
  const tags = ["cart-abandoned", "ecommerce.in_cart"];
  if (originalStatus === "checkout-started") tags.push("ecommerce.in_checkout");
  if (typeof cart.couponCode === "string" && cart.couponCode) tags.push("coupon-user");
  if ((typeof cart.bpgCode === "string" && cart.bpgCode) || (typeof cart.giftCode === "string" && /^BPG/i.test(cart.giftCode))) tags.push("bpg-gift-code-user");

  const result = await upsertSubscriber({
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
  }).catch(() => ({ ok: false }));

  return Boolean(result.ok);
}

async function evaluateRecoveryEligibility(payload: PayloadClient, cart: PayloadDoc) {
  const email = validEmail(cart.email);
  if (!email || !bool(cart.marketingConsent)) return { email, eligible: false, subscriber: null, suppressed: false };
  const subscriber = await ensureSubscriber(payload, email);
  const suppressed = subscriberSuppressed(subscriber);
  return { email, eligible: !suppressed, subscriber, suppressed };
}

async function transitionToAbandoned(payload: PayloadClient, cart: PayloadDoc, source: string) {
  if (isClosedCart(cart)) return { updated: null as PayloadDoc | null, eligible: false, originalStatus: "" };

  const originalStatus = typeof cart.status === "string" ? cart.status : "active-cart";
  const eligibility = await evaluateRecoveryEligibility(payload, cart);
  const now = new Date().toISOString();
  const updated = (await payload.update({
    collection: "abandoned-carts",
    overrideAccess: true,
    id: cart.id,
    data: {
      status: "abandoned",
      abandonedAt: cart.abandonedAt || now,
      recoveryEligible: eligibility.eligible,
      recoveryState: eligibility.eligible ? "eligible" : eligibility.suppressed ? "suppressed" : "not-eligible",
      recoveryEmailError: eligibility.suppressed ? "subscriber-unsubscribed" : undefined,
      lastActivityAt: now,
      source
    }
  })) as PayloadDoc;

  return { updated, eligible: eligibility.eligible, originalStatus };
}

async function deliverReminder(payload: PayloadClient, cart: PayloadDoc, kind: "first" | "second", allowSend: boolean): Promise<CartRecoveryReminderResult> {
  const email = validEmail(cart.email);
  if (!email) return { ok: false, sent: false, reason: "missing-email", cartId: cart.id };
  if (!bool(cart.marketingConsent)) return { ok: false, sent: false, reason: "missing-consent", cartId: cart.id };
  if (!bool(cart.recoveryEligible) || cart.status !== "abandoned") return { ok: false, sent: false, reason: "not-eligible", cartId: cart.id };

  const subscriber = await findSubscriber(payload, email);
  if (subscriberSuppressed(subscriber)) {
    await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: { recoveryEligible: false, recoveryState: "suppressed", recoveryEmailError: "subscriber-unsubscribed" }
    });
    return { ok: false, sent: false, reason: "subscriber-unsubscribed", cartId: cart.id };
  }

  if (!allowSend || !emailDeliveryEnabled()) {
    return { ok: true, sent: false, reason: "email-delivery-disabled", cartId: cart.id };
  }

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
    recoveryEmailError: result.ok ? undefined : result.error || "send-failed"
  };
  if (result.ok && kind === "first") {
    data.firstReminderSentAt = now;
    data.lastReminderSentAt = now;
    data.recoveryState = "reminder-1-sent";
  }
  if (result.ok && kind === "second") {
    data.secondReminderSentAt = now;
    data.lastReminderSentAt = now;
    data.recoveryState = "reminder-2-sent";
  }

  await payload.update({ collection: "abandoned-carts", overrideAccess: true, id: cart.id, data });
  return { ok: result.ok, sent: result.ok, reason: result.ok ? undefined : result.error || "send-failed", cartId: cart.id };
}

async function findOverdueCarts(payload: PayloadClient) {
  const activeCutoff = dateHoursAgo(configuredHours("CART_ACTIVE_ABANDON_AFTER_HOURS", 4));
  const checkoutCutoff = dateHoursAgo(configuredHours("CART_CHECKOUT_ABANDON_AFTER_HOURS", 1));
  const [active, checkout] = await Promise.all([
    payload.find({
      collection: "abandoned-carts",
      overrideAccess: true,
      depth: 0,
      limit: 200,
      where: { and: [{ status: { equals: "active-cart" } }, { lastActivityAt: { less_than: activeCutoff } }] }
    }) as Promise<PayloadFindResult>,
    payload.find({
      collection: "abandoned-carts",
      overrideAccess: true,
      depth: 0,
      limit: 200,
      where: { and: [{ status: { equals: "checkout-started" } }, { checkoutStartedAt: { less_than: checkoutCutoff } }] }
    }) as Promise<PayloadFindResult>
  ]);
  return [...(active.docs || []), ...(checkout.docs || [])];
}

async function sendSecondReminders(payload: PayloadClient, allowSend: boolean) {
  const cutoff = dateHoursAgo(configuredHours("CART_SECOND_REMINDER_AFTER_HOURS", 24));
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
    const outcome = await deliverReminder(payload, cart, "second", allowSend);
    if (outcome.sent) sent += 1;
  }
  return sent;
}

export async function runCartRecoveryAutomation(options: CartRecoveryRunOptions = {}): Promise<CartRecoveryRunResult> {
  const payload = await getPayloadClient();
  const allowSend = options.sendReminders !== false;
  let candidates: PayloadDoc[] = [];

  if (options.forceCartId !== undefined) {
    try {
      const cart = (await payload.findByID({ collection: "abandoned-carts", overrideAccess: true, id: options.forceCartId, depth: 0 })) as PayloadDoc | null;
      if (cart) candidates = [cart];
    } catch {
      candidates = [];
    }
  } else {
    candidates = await findOverdueCarts(payload);
  }

  let markedAbandoned = 0;
  let firstRemindersSent = 0;
  let sequenzySyncsAttempted = 0;

  for (const cart of candidates) {
    const result = await transitionToAbandoned(payload, cart, options.source || "cart-recovery-cron");
    if (!result.updated) continue;
    markedAbandoned += 1;

    if (result.eligible) {
      sequenzySyncsAttempted += 1;
      await syncAbandonedCartToSequenzy(result.updated, result.originalStatus);
      const reminder = await deliverReminder(payload, result.updated, "first", allowSend);
      if (reminder.sent) firstRemindersSent += 1;
    }
  }

  const secondRemindersSent = await sendSecondReminders(payload, allowSend);

  return {
    emailsEnabled: emailDeliveryEnabled() && allowSend,
    activeCartHours: configuredHours("CART_ACTIVE_ABANDON_AFTER_HOURS", 4),
    checkoutStartedHours: configuredHours("CART_CHECKOUT_ABANDON_AFTER_HOURS", 1),
    markedAbandoned,
    firstRemindersSent,
    secondRemindersSent,
    sequenzySyncsAttempted,
    forcedCartId: options.forceCartId
  };
}

export async function sendManualCartRecoveryReminder(cartId: string | number, kind: "first" | "second" = "first"): Promise<CartRecoveryReminderResult> {
  if (!emailDeliveryEnabled()) return { ok: false, sent: false, reason: "email-delivery-disabled", cartId };

  const payload = await getPayloadClient();
  try {
    const cart = (await payload.findByID({ collection: "abandoned-carts", overrideAccess: true, id: cartId, depth: 0 })) as PayloadDoc | null;
    if (!cart) return { ok: false, sent: false, reason: "cart-not-found", cartId };
    return deliverReminder(payload, cart, kind, true);
  } catch (error) {
    console.error("Manual cart reminder failed", { cartId, error });
    return { ok: false, sent: false, reason: "manual-reminder-failed", cartId };
  }
}

export function getCartRecoveryConfig() {
  return {
    emailsEnabled: emailDeliveryEnabled(),
    activeCartHours: configuredHours("CART_ACTIVE_ABANDON_AFTER_HOURS", 4),
    checkoutStartedHours: configuredHours("CART_CHECKOUT_ABANDON_AFTER_HOURS", 1),
    secondReminderHours: configuredHours("CART_SECOND_REMINDER_AFTER_HOURS", 24)
  };
}
