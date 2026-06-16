import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { books, bookFormats } from "@/lib/books";
import { giftDownloadDef, isGiftCode, normalizeGiftCode } from "@/lib/gifts";
import { sendGiftRedeemedEmail, upsertSubscriber } from "@/lib/email";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function normEmail(v: unknown) {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

function priceForFormat(format: "digital" | "audiobook") {
  const label = format === "audiobook" ? "Audiobook" : "PDF / EPUB";
  return bookFormats.find((f) => f.label === label)?.price ?? (format === "audiobook" ? 21.99 : 15.99);
}

export async function POST(request: Request) {
  let body: { code?: unknown; email?: unknown; password?: unknown; consent?: unknown; bookSlug?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawCode = typeof body.code === "string" ? body.code : "";
  if (!rawCode || !isGiftCode(rawCode)) return NextResponse.json({ error: "Enter a valid gift code (starts with BPG)." }, { status: 400 });
  const code = normalizeGiftCode(rawCode);

  const email = normEmail(body.email);
  if (!email) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const password = typeof body.password === "string" ? body.password : "";
  const consent = body.consent === true;
  const chosenSlug = typeof body.bookSlug === "string" ? body.bookSlug.trim() : "";

  try {
    const payload = await getPayloadClient();

    const giftRes = (await payload.find({ collection: "gifts", limit: 1, where: { redemptionCode: { equals: code } } })) as PayloadFindResult;
    const gift = giftRes.docs?.[0];
    if (!gift) return NextResponse.json({ error: "That gift code was not found." }, { status: 404 });

    if (gift.status === "redeemed") return NextResponse.json({ error: "This gift code has already been redeemed." }, { status: 409 });
    if (gift.status === "revoked") return NextResponse.json({ error: "This gift code is no longer valid." }, { status: 409 });
    const expiresAt = typeof gift.expiresAt === "string" ? new Date(gift.expiresAt).getTime() : 0;
    if (gift.status === "expired" || (expiresAt && expiresAt < Date.now())) {
      if (gift.status !== "expired") await payload.update({ collection: "gifts", id: gift.id, data: { status: "expired" } });
      return NextResponse.json({ error: "This gift code has expired." }, { status: 410 });
    }

    const giftFormat = gift.format === "audiobook" ? "audiobook" : "digital";
    const valueCeiling = typeof gift.valueCeiling === "number" ? gift.valueCeiling : priceForFormat(giftFormat);

    // Resolve which book the recipient gets. Default to the gift's source book.
    let slug = chosenSlug;
    if (slug) {
      const cat = books.find((b) => b.slug === slug);
      if (!cat) return NextResponse.json({ error: "That book is not available." }, { status: 400 });
      if (priceForFormat(giftFormat) > valueCeiling) {
        return NextResponse.json({ error: "That item is above the gift's value." }, { status: 400 });
      }
    } else {
      // fall back to source book slug
      const sourceBookId = typeof gift.sourceBook === "object" && gift.sourceBook ? (gift.sourceBook as PayloadDoc).id : gift.sourceBook;
      if (sourceBookId) {
        try {
          const sb = (await payload.findByID({ collection: "books", id: sourceBookId as string | number, depth: 0 })) as PayloadDoc | null;
          if (sb && typeof sb.slug === "string") slug = sb.slug;
        } catch {
          slug = "";
        }
      }
    }
    if (!slug) return NextResponse.json({ error: "Please choose a book to redeem." }, { status: 400 });

    const catalogBook = books.find((b) => b.slug === slug);
    const bookRes = (await payload.find({ collection: "books", limit: 1, where: { slug: { equals: slug } } })) as PayloadFindResult;
    const book = bookRes.docs?.[0];
    if (!book) return NextResponse.json({ error: "That book is not available." }, { status: 400 });

    // Find or create the recipient account.
    const existing = (await payload.find({ collection: "users", limit: 1, where: { email: { equals: email } } })) as PayloadFindResult;
    let user = existing.docs?.[0];
    let createdAccount = false;

    if (!user) {
      if (password.length < 8) return NextResponse.json({ error: "Choose a password (at least 8 characters)." }, { status: 400 });
      user = (await payload.create({
        collection: "users",
        data: { email, password, role: "customer", acquiredVia: "gift", passwordSetByCustomer: true }
      })) as PayloadDoc;
      createdAccount = true;
    }

    // Deliver via a downloads record (one download), reusing the existing R2 delivery path.
    const def = giftDownloadDef(giftFormat);
    const prefix = (process.env.R2_KEY_PREFIX || "books").replace(/\/+$/g, "");
    const download = (await payload.create({
      collection: "downloads",
      data: {
        customer: user.id,
        book: book.id,
        fileLabel: `${catalogBook?.title || "Benny & Penny Book"} — ${def.format.toUpperCase()} (gift)`,
        format: def.format,
        r2ObjectKey: `${prefix}/${slug}/${def.format}.${def.ext}`,
        maxDownloads: typeof gift.downloadsGranted === "number" ? gift.downloadsGranted : 1,
        downloadsUsed: 0,
        isActive: true,
        adminNotes: `Gift redemption of code ${code}.`
      }
    })) as PayloadDoc;

    await payload.update({
      collection: "gifts",
      id: gift.id,
      data: { status: "redeemed", redeemedBy: user.id, redeemedBook: book.id, redeemedDownload: download.id, redeemedAt: new Date().toISOString() }
    });

    // Notify the gifter that their gift was claimed (best-effort).
    try {
      const gifterId = typeof gift.gifter === "object" && gift.gifter ? (gift.gifter as PayloadDoc).id : gift.gifter;
      if (gifterId) {
        const gifterRes = (await payload.find({ collection: "users", limit: 1, where: { id: { equals: gifterId } } })) as PayloadFindResult;
        const gifterEmail = typeof gifterRes.docs?.[0]?.email === "string" ? (gifterRes.docs[0].email as string) : null;
        if (gifterEmail) {
          await sendGiftRedeemedEmail({ to: gifterEmail, code, bookTitle: catalogBook?.title });
        }
      }
    } catch (notifyError) {
      console.error("Gift-redeemed notify failed (non-fatal)", notifyError);
    }

    // Catalogue the lead (best-effort).
    if (consent) {
      try {
        const sub = (await payload.find({ collection: "subscribers", limit: 1, where: { email: { equals: email } } })) as PayloadFindResult;
        if (!sub.docs?.length) {
          await payload.create({ collection: "subscribers", data: { email, marketingOptIn: true, source: "gift-redemption" } });
        }
        await upsertSubscriber({ email, tags: ["gift-recipient"], customAttributes: { acquiredVia: "gift" } });
      } catch (e) {
        console.error("Gift lead capture failed (non-fatal)", e);
      }
    }

    void crypto; // reserved for future tokenized flows
    return NextResponse.json({ ok: true, createdAccount, email });
  } catch (error) {
    console.error("Gift redemption failed", error);
    return NextResponse.json({ error: "We could not redeem this code right now. Please try again." }, { status: 500 });
  }
}
