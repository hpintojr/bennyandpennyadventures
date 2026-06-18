import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { digitalValueForFormat, generateGiftCode } from "@/lib/gifts";
import { sendGiftEmail, upsertSubscriber } from "@/lib/email";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

const GIFT_EXPIRY_DAYS = 90;

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

async function getUser() {
  const payload = await getPayloadClient();
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadDoc | null | undefined;
  return { payload, user: user?.id ? user : null };
}

function num(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function relId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

function relTitle(value: unknown) {
  if (value && typeof value === "object" && "title" in value) {
    const t = (value as { title?: unknown }).title;
    if (typeof t === "string" && t.trim()) return t.trim();
  }
  return null;
}

function giftFormatFromDownload(format: unknown): "digital" | "audiobook" | null {
  if (format === "audiobook") return "audiobook";
  if (format === "pdf" || format === "epub") return "digital";
  return null;
}

function formatLabel(f: "digital" | "audiobook") {
  return f === "audiobook" ? "Audiobook" : "PDF / EPUB";
}

async function loadOwnedDownload(payload: Awaited<ReturnType<typeof getPayloadClient>>, id: string | number, customerId: string | number) {
  try {
    const doc = (await payload.findByID({ collection: "downloads", id, depth: 1 })) as PayloadDoc | null;
    if (!doc) return null;
    if (String(relId(doc.customer)) !== String(customerId)) return null;
    return doc;
  } catch {
    return null;
  }
}

export async function GET() {
  const { payload, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const downloads = (await payload.find({
    collection: "downloads",
    depth: 1,
    limit: 200,
    where: { and: [{ customer: { equals: user.id } }, { isActive: { not_equals: false } }] }
  })) as PayloadFindResult;

  const giftable = (downloads.docs || [])
    .map((d) => {
      const giftFormat = giftFormatFromDownload(d.format);
      if (!giftFormat) return null;
      const remaining = num(d.maxDownloads) - num(d.downloadsUsed) - num(d.giftsIssued);
      return {
        downloadId: d.id,
        bookTitle: relTitle(d.book) || (typeof d.fileLabel === "string" ? d.fileLabel : "Your book"),
        format: giftFormat,
        formatLabel: formatLabel(giftFormat),
        giftableRemaining: Math.max(0, remaining)
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const giftsResult = (await payload.find({
    collection: "gifts",
    depth: 0,
    limit: 200,
    sort: "-createdAt",
    where: { gifter: { equals: user.id } }
  })) as PayloadFindResult;

  const gifts = (giftsResult.docs || []).map((g) => ({
    id: g.id,
    code: g.redemptionCode,
    status: g.status,
    recipientEmail: g.recipientEmail,
    format: g.format,
    expiresAt: g.expiresAt,
    redeemedAt: g.redeemedAt,
    createdAt: g.createdAt
  }));

  return NextResponse.json({ giftable, gifts });
}

async function generateUniqueCode(payload: Awaited<ReturnType<typeof getPayloadClient>>) {
  for (let i = 0; i < 12; i += 1) {
    const code = generateGiftCode();
    const existing = (await payload.find({ collection: "gifts", limit: 1, where: { redemptionCode: { equals: code } } })) as PayloadFindResult;
    if (!existing.docs?.length) return code;
  }
  return `${generateGiftCode()}${Math.floor(Math.random() * 90 + 10)}`;
}

export async function POST(request: Request) {
  const { payload, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { downloadId?: unknown; recipientEmail?: unknown; message?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const downloadId = body.downloadId as string | number | undefined;
  const recipientEmail = typeof body.recipientEmail === "string" ? body.recipientEmail.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : undefined;

  if (!downloadId) return NextResponse.json({ error: "Choose a book to gift." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
    return NextResponse.json({ error: "Enter a valid recipient email." }, { status: 400 });
  }

  const download = await loadOwnedDownload(payload, downloadId, user.id);
  if (!download) return NextResponse.json({ error: "That download is not on your account." }, { status: 404 });

  const giftFormat = giftFormatFromDownload(download.format);
  if (!giftFormat) return NextResponse.json({ error: "Only digital and audiobook items can be gifted." }, { status: 400 });

  const remaining = num(download.maxDownloads) - num(download.downloadsUsed) - num(download.giftsIssued);
  if (remaining <= 0) return NextResponse.json({ error: "You have no gift slots left on this item." }, { status: 403 });

  const code = await generateUniqueCode(payload);
  const expiresAt = new Date(Date.now() + GIFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const gift = (await payload.create({
    collection: "gifts",
    data: {
      redemptionCode: code,
      status: "sent",
      gifter: user.id,
      sourceDownload: download.id,
      sourceBook: relId(download.book) || undefined,
      format: giftFormat,
      valueCeiling: digitalValueForFormat(giftFormat),
      downloadsGranted: 1,
      recipientEmail,
      message,
      expiresAt
    }
  })) as PayloadDoc;

  await payload.update({
    collection: "downloads",
    id: download.id,
    data: { giftsIssued: num(download.giftsIssued) + 1 }
  });

  const senderEmail = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  if (senderEmail) {
    await upsertSubscriber({
      email: senderEmail,
      firstName: typeof user.firstName === "string" ? user.firstName : undefined,
      lastName: typeof user.lastName === "string" ? user.lastName : undefined,
      tags: ["gift-sender"],
      customAttributes: { acquiredVia: "gift-sender", giftId: gift.id, giftFormat, giftCode: code }
    }).catch(() => null);
  }

  let emailed = false;
  try {
    const fn = typeof user.firstName === "string" ? user.firstName.trim() : "";
    const ln = typeof user.lastName === "string" ? user.lastName.trim() : "";
    const gifterName = [fn, ln].filter(Boolean).join(" ") || undefined;
    const gifterEmail = typeof user.email === "string" ? user.email.trim() : undefined;
    const result = await sendGiftEmail({
      to: recipientEmail,
      code,
      bookTitle: relTitle(download.book) || undefined,
      formatLabel: formatLabel(giftFormat),
      gifterName,
      gifterEmail,
      message,
      expiresAt
    });
    emailed = result.ok;
    if (!result.ok && result.error !== "email-not-configured") console.error("Gift email send failed", result.error);
  } catch (error) {
    console.error("Gift email send threw", error);
  }

  return NextResponse.json({
    emailed,
    gift: { id: gift.id, code, recipientEmail, format: giftFormat, expiresAt },
    redeemUrl: `/gift/redeem?code=${encodeURIComponent(code)}`
  }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { payload, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: unknown; action?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const id = body.id as string | number | undefined;
  if (!id || body.action !== "revoke") return NextResponse.json({ error: "A gift id and action are required." }, { status: 400 });

  let gift: PayloadDoc | null = null;
  try {
    gift = (await payload.findByID({ collection: "gifts", id, depth: 0 })) as PayloadDoc | null;
  } catch {
    gift = null;
  }
  if (!gift || String(relId(gift.gifter)) !== String(user.id)) return NextResponse.json({ error: "Gift not found." }, { status: 404 });
  if (gift.status !== "sent") return NextResponse.json({ error: "Only unredeemed gifts can be revoked." }, { status: 409 });

  await payload.update({ collection: "gifts", id: gift.id, data: { status: "revoked" } });

  const sourceId = relId(gift.sourceDownload);
  if (sourceId) {
    try {
      const dl = (await payload.findByID({ collection: "downloads", id: sourceId, depth: 0 })) as PayloadDoc | null;
      if (dl) await payload.update({ collection: "downloads", id: sourceId, data: { giftsIssued: Math.max(0, num(dl.giftsIssued) - 1) } });
    } catch {
      // The gift revoke still completed even if a source record is unavailable.
    }
  }

  return NextResponse.json({ ok: true });
}
