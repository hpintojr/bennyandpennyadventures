import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { verifyCartRecoveryToken } from "@/lib/cartRecoveryTokens";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  const payloadData = verifyCartRecoveryToken(token);
  if (!payloadData) return NextResponse.json({ error: "This cart recovery link is invalid or has expired." }, { status: 400 });

  try {
    const { default: config } = await import("@payload-config");
    const payload = await getPayload({ config });
    const cart = (await payload.findByID({ collection: "abandoned-carts", overrideAccess: true, id: payloadData.cartId, depth: 0 })) as PayloadDoc | null;
    if (!cart || cart.status !== "abandoned") return NextResponse.json({ error: "This cart is no longer available for recovery." }, { status: 410 });

    const rawItems = Array.isArray(cart.items) ? cart.items as PayloadDoc[] : [];
    const items = rawItems
      .map((item) => {
        const slug = text(item.slug);
        const format = text(item.format);
        const title = text(item.title) || "Benny & Penny book";
        const qty = Math.max(1, Math.floor(number(item.qty, 1)));
        const price = Math.max(0, number(item.unitPrice));
        if (!slug || !format) return null;
        return { id: `${slug}:${format}`, slug, title, format, price, qty, coverImage: text(item.coverImage) };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (!items.length) return NextResponse.json({ error: "This cart no longer has recoverable items." }, { status: 410 });

    const now = new Date().toISOString();
    const metadata = typeof cart.metadata === "object" && cart.metadata ? (cart.metadata as Record<string, unknown>) : {};
    await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: { lastActivityAt: now, metadata: { ...metadata, recoveryLinkOpenedAt: now } }
    });

    return NextResponse.json({ cartToken: cart.cartToken, items });
  } catch (error) {
    console.error("Cart recovery lookup failed", error);
    return NextResponse.json({ error: "We could not restore this cart right now." }, { status: 500 });
  }
}
