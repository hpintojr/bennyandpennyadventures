import { NextResponse } from "next/server";
import { getPayload } from "payload";

export const runtime = "nodejs";

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

export async function POST() {
  const payload = await getPayloadClient();
  const response = NextResponse.json({ ok: true });

  await payload.authOperations.logout({
    collection: "users",
    res: response
  });

  return response;
}
