import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { upsertSubscriber } from "@/lib/email";
import { verifyUnsubscribeToken } from "@/lib/emailUnsubscribeTokens";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

function responseHtml(message: string) {
  return new NextResponse(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Benny & Penny Adventures</title></head><body style="margin:0;background:#fdf6ec;font-family:Arial,Helvetica,sans-serif;color:#3c3c3c;"><main style="max-width:560px;margin:72px auto;padding:24px;"><section style="background:#fff;border:1px solid #e6d9c4;border-radius:18px;padding:28px;text-align:center;"><h1 style="font-family:Georgia,'Times New Roman',serif;color:#1f5c5f;font-size:28px;margin:0 0 12px;">Benny &amp; Penny Adventures</h1><p style="font-size:16px;line-height:1.6;margin:0;">${message}</p></section></main></body></html>`, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const payloadData = verifyUnsubscribeToken(token);
  if (!payloadData) return responseHtml("This unsubscribe link is invalid or has expired.");

  try {
    const { default: config } = await import("@payload-config");
    const payload = await getPayload({ config });
    const result = (await payload.find({ collection: "subscribers", overrideAccess: true, limit: 1, where: { email: { equals: payloadData.email } } })) as PayloadFindResult;
    const existing = result.docs?.[0];
    const data = { email: payloadData.email, marketingOptIn: false, productUpdatesOptIn: false, freePrintablesOptIn: false, unsubscribedAt: new Date().toISOString() };
    if (existing) await payload.update({ collection: "subscribers", overrideAccess: true, id: existing.id, data });
    else await payload.create({ collection: "subscribers", overrideAccess: true, data: { ...data, source: "cart-reminder-unsubscribe" } });
    await upsertSubscriber({ email: payloadData.email, customAttributes: { marketingOptIn: false, unsubscribedAt: new Date().toISOString(), cartRecoverySuppressed: true } }).catch(() => null);
    return responseHtml("You have been unsubscribed from cart reminders. You will not receive additional cart-recovery emails.");
  } catch (error) {
    console.error("Cart reminder unsubscribe failed", error);
    return responseHtml("We could not complete the unsubscribe right now. Please try the link again shortly.");
  }
}
