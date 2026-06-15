import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { getDefaultExpirySeconds, getR2DownloadUrl, isR2Configured } from "@/lib/r2";

export const runtime = "nodejs";

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
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

function isExpired(value: unknown) {
  const dateValue = getString(value);
  if (!dateValue) return false;
  return new Date(dateValue).getTime() < Date.now();
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

  const maxDownloads = typeof download.maxDownloads === "number" ? download.maxDownloads : null;
  const downloadsUsed = typeof download.downloadsUsed === "number" ? download.downloadsUsed : 0;
  if (maxDownloads !== null && downloadsUsed >= maxDownloads) {
    return NextResponse.json({ error: "You have reached the download limit for this item." }, { status: 403 });
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

    // Count the download and stamp the time. Best-effort: if this update fails we
    // still return the link the customer is entitled to.
    try {
      await payload.update({
        collection: "downloads",
        id: download.id,
        data: { downloadsUsed: downloadsUsed + 1, lastDownloadedAt: new Date().toISOString() }
      });
    } catch (countError) {
      console.error("Download count update failed; link still issued", countError);
    }

    return NextResponse.json({
      url: signedUrl,
      filename: downloadFilename,
      expiresInSeconds,
      downloadsRemaining: maxDownloads !== null ? Math.max(0, maxDownloads - (downloadsUsed + 1)) : null
    });
  } catch (error) {
    console.error("R2 signed download URL generation failed", error);
    return NextResponse.json({ error: "We could not prepare your download right now." }, { status: 500 });
  }
}
