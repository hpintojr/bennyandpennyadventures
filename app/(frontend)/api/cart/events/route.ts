import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { upsertSubscriber } from "@/lib/email";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

type CartEventBody = {
  event?: unknown;
  cartToken?: unknown;
  email?: unknown;
  marketingConsent?: unknown;
  items?: unknown;
  couponCode?: unknown;
  giftCode?: unknown;
  bpgCode?: unknown;
};

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function email(value: unknown) {
  const normalized = text(value)?.toLowerCase();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : undefined;
}

function num(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeItems(value: unknown) {
  const raw = Array.isArray(value) ? value : [];
  return raw.map((entry) => {
    const item = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const slug = text(item.slug);
    const title = text(item.title) || slug || "Cart item";
    const format = text(item.format) || "Unknown";
    const qty = Math.max(0, Math.floor(num(item.qty, 1)));
    const unitPrice = Math.max(0, num(item.unitPrice ?? item.price, 0));
    const coverImage = text(item.coverImage);
    return { slug, title, format, qty, unitPrice, coverImage };
  });
}

function totals(items: ReturnType<typeof normalizeItems>) {
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = Number(items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0).toFixed(2));
  const requiresShipping = items.some((item) => /paperback|hardcover/i.test(item.format));
  return { itemCount, subtotal, requiresShipping };
}

async function findCart(payload: Awaited<ReturnType<typeof getPayloadClient>>, cartToken: string) {
  const result = (await payload.find({ collection: "abandoned-carts", limit: 1, where: { cartToken: { equals: cartToken } } })) as PayloadFindResult;
  return result.docs?.[0] || null;
}

async function findOrCreateSubscriber(payload: Awaited<ReturnType<typeof getPayloadClient>>, subscriberEmail: string) {
  const result = (await payload.find({ collection: "subscribers", limit: 1, where: { email: { equals: subscriberEmail } } })) as PayloadFindResult;
  if (result.docs?.[0]) return result.docs[0];
  try {
    return (await payload.create({ collection: "subscribers", data: { email: subscriberEmail, marketingOptIn: true, source: "cart-tracking" } })) as PayloadDoc;
  } catch {
    return null;
  }
}

function code(value: unknown) {
  return text(value)?.slice(0, 80);
}

export async function POST(request: Request) {
  let body: CartEventBody;
  try {
    body = (await request.json()) as CartEventBody;
  } catch {
    return NextResponse.json({ error: "Invalid cart event." }, { status: 400 });
  }

  const cartToken = text(body.cartToken);
  if (!cartToken) return NextResponse.json({ error: "Missing cart token." }, { status: 400 });

  const payload = await getPayloadClient();
  const auth = await payload.auth({ headers: await getHeaders() }).catch(() => null);
  const user = auth?.user && (auth.user as PayloadDoc).id ? (auth.user as PayloadDoc) : null;
  const knownEmail = email(body.email) || email(user?.email);
  const items = normalizeItems(body.items);
  const summary = totals(items);
  const couponCode = code(body.couponCode);
  const giftCode = code(body.giftCode);
  const bpgCode = code(body.bpgCode);
  const consent = body.marketingConsent === true;
  const existing = await findCart(payload, cartToken);
  const status = body.event === "cart-cleared" ? "dismissed" : existing?.status === "converted" ? "converted" : "active-cart";
  const now = new Date().toISOString();

  let subscriber: PayloadDoc | null = null;
  const syncTags = ["ecommerce.in_cart"];
  if (couponCode) syncTags.push("coupon-user");
  if (bpgCode || /^BPG/i.test(giftCode || "")) syncTags.push("bpg-gift-code-user");

  if (knownEmail && consent) {
    subscriber = await findOrCreateSubscriber(payload, knownEmail);
    await upsertSubscriber({
      email: knownEmail,
      tags: syncTags,
      customAttributes: { acquiredVia: "cart", cartToken, couponCode, giftCode, bpgCode, itemCount: summary.itemCount, subtotal: summary.subtotal }
    }).catch(() => null);
  }

  const data: Record<string, unknown> = {
    email: knownEmail || existing?.email,
    customer: user?.id || existing?.customer,
    subscriber: subscriber?.id || existing?.subscriber,
    status,
    cartToken,
    items,
    itemCount: summary.itemCount,
    subtotal: summary.subtotal,
    requiresShipping: summary.requiresShipping,
    marketingConsent: consent || existing?.marketingConsent === true,
    couponCode: couponCode || existing?.couponCode,
    giftCode: giftCode || existing?.giftCode,
    bpgCode: bpgCode || existing?.bpgCode,
    lastActivityAt: now,
    lastSequenzySyncAt: knownEmail && consent ? now : existing?.lastSequenzySyncAt,
    sequenzyTags: knownEmail && consent ? syncTags : existing?.sequenzyTags,
    source: "cart",
    metadata: { event: text(body.event) || "cart-updated" }
  };

  if (!existing) data.firstSeenAt = now;

  const cart = existing
    ? await payload.update({ collection: "abandoned-carts", id: existing.id, data })
    : await payload.create({ collection: "abandoned-carts", data });

  return NextResponse.json({ ok: true, cartId: (cart as PayloadDoc).id });
}
