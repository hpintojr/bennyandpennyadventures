import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

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

  return NextResponse.json(
    {
      error: "Download delivery is not configured yet.",
      detail: "This account has a valid download record, but private signed file delivery still needs to be connected."
    },
    { status: 503 }
  );
}
