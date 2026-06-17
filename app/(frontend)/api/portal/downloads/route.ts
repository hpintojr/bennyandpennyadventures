import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { getDefaultExpirySeconds, getR2DownloadUrl, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = {
  docs?: PayloadDoc[];
};

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function getRelationId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isExpired(value: unknown) {
  const dateValue = getString(value);
  if (!dateValue) return false;
  return new Date(dateValue).getTime() < Date.now();
}

function isReadableFormat(format: string) {
  return format === "pdf" || format === "epub";
}

async function getReadablePool(payload: Awaited<ReturnType<typeof getPayload>>, customerId: string | number, bookId: string | number) {
  const result = (await payload.find({
    collection: "downloads",
    depth: 0,
    limit: 20,
    where: {
      and: [
        { customer: { equals: customerId } },
        { book: { equals: bookId } },
        { format: { in: ["pdf", "epub"] } }
      ]
    }
  })) as PayloadFindResult;

  const docs = result.docs || [];
  const maxDownloads = Math.max(...docs.map((doc) => getNumber(doc.maxDownloads, 0)), 0) || null;
  const downloadsUsed = docs.reduce((total, doc) => total + getNumber(doc.downloadsUsed, 0), 0);
  const giftsIssued = docs.reduce((total, doc) => total + getNumber(doc.giftsIssued, 0), 0);

  return { maxDownloads, downloadsUsed, giftsIssued };
}

async function getAccessPool(payload: Awaited<ReturnType<typeof getPayload>>, download: PayloadDoc, customerId: string | number) {
  const format = getString(download.format) || "";
  const bookId = getRelationId(download.book);

  if (bookId && isReadableFormat(format)) {
    return getReadablePool(payload, customerId, bookId);
  }

  return {
    maxDownloads: typeof download.maxDownloads === "number" ? download.maxDownloads : null,
    downloadsUsed: getNumber(download.downloadsUsed, 0),
    giftsIssued: getNumber(download.giftsIssued, 0)
  };
}

export async function GET(request: Request) {
  const payload = await getPayloadClient();
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadDoc | null | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Please sign in to access your download." }, { status: 401 });
  }

  const url = new URL(request.url);
  const downloadId = url.searchParams.get("download_id");

  if (!downloadId) {
    return NextResponse.json({ error: "download_id is required." }, { status: 400 });
  }

  const download = (await payload.findByID({
    collection: "downloads",
    id: downloadId,
    depth: 1
  })) as PayloadDoc | null;

  if (!download?.id) {
    return NextResponse.json({ error: "Download not found." }, { status: 404 });
  }

  const customerId = getRelationId(download.customer);

  if (String(customerId) !== String(user.id)) {
    return NextResponse.json({ error: "This download is not linked to your account." }, { status: 403 });
  }

  if (download.isActive === false) {
    return NextResponse.json({ error: "This download is inactive." }, { status: 403 });
  }

  if (isExpired(download.accessExpiresAt)) {
    return NextResponse.json({ error: "This download link has expired." }, { status: 403 });
  }

  const r2ObjectKey = getString(download.r2ObjectKey);
  if (!r2ObjectKey) {
    return NextResponse.json({ error: "This file has not been uploaded yet." }, { status: 503 });
  }

  const accessPool = await getAccessPool(payload, download, customerId || user.id);
  const slotsUsed = accessPool.downloadsUsed + accessPool.giftsIssued;

  if (accessPool.maxDownloads !== null && slotsUsed >= accessPool.maxDownloads) {
    return NextResponse.json({ error: "You have reached the access limit for this title." }, { status: 403 });
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: "File delivery is not configured yet." }, { status: 503 });
  }

  const extByFormat: Record<string, string> = { pdf: "pdf", epub: "epub", audiobook: "mp3" };
  const format = getString(download.format) || "";
  const ext = extByFormat[format] || r2ObjectKey.split(".").pop() || "dat";
  const baseName = (getString(download.fileLabel) || "benny-penny-book").replace(/[^a-z0-9\-_ ]/gi, "").trim() || "benny-penny-book";
  const downloadFilename = `${baseName}.${ext}`;

  try {
    const expiresInSeconds = getDefaultExpirySeconds();
    const signedUrl = await getR2DownloadUrl(r2ObjectKey, { expiresInSeconds, downloadFilename });

    try {
      const currentFileDownloadsUsed = getNumber(download.downloadsUsed, 0);
      await payload.update({
        collection: "downloads",
        id: download.id,
        data: { downloadsUsed: currentFileDownloadsUsed + 1, lastDownloadedAt: new Date().toISOString() }
      });
    } catch (countError) {
      console.error("Download count update failed; link still issued", countError);
    }

    return NextResponse.json({
      url: signedUrl,
      filename: downloadFilename,
      expiresInSeconds,
      downloadsRemaining: accessPool.maxDownloads !== null ? Math.max(0, accessPool.maxDownloads - (slotsUsed + 1)) : null
    });
  } catch (error) {
    console.error("R2 signed download URL generation failed", error);
    return NextResponse.json({ error: "We could not prepare your download right now." }, { status: 500 });
  }
}
