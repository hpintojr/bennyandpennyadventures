import { NextResponse } from "next/server";
import { getPayload } from "payload";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  try {
    let body: { sessionId?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Invalid conversion request." }, { status: 400 });
    }

    const sessionId = text(body.sessionId);
    if (!sessionId || !sessionId.startsWith("cs_")) return NextResponse.json({ error: "Missing checkout session." }, { status: 400 });

    const payload = await getPayloadClient();
    const result = (await payload.find({
      collection: "abandoned-carts",
      overrideAccess: true,
      limit: 1,
      where: { stripeCheckoutSessionId: { equals: sessionId } }
    })) as PayloadFindResult;
    const cart = result.docs?.[0];
    if (!cart) return NextResponse.json({ ok: true, converted: false });

    const now = new Date().toISOString();
    await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: {
        status: "converted",
        convertedAt: now,
        lastActivityAt: now,
        metadata: { ...(typeof cart.metadata === "object" && cart.metadata ? (cart.metadata as Record<string, unknown>) : {}), convertedFromThankYou: true }
      }
    });

    return NextResponse.json({ ok: true, converted: true });
  } catch (error) {
    console.error("Cart conversion tracking failed", error);
    return NextResponse.json({ error: "Cart conversion tracking failed." }, { status: 500 });
  }
}
