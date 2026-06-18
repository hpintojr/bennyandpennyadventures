import { getPayload } from "payload";
import type Stripe from "stripe";
import { upsertSubscriber } from "@/lib/email";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

type Summary = { orderId: string | number; orderNumber: string };

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isBpg(value: unknown) {
  return typeof value === "string" && /^BPG/i.test(value.trim());
}

export async function syncPurchaseAttribution(session: Stripe.Checkout.Session, summary: Summary) {
  try {
    const { default: config } = await import("@payload-config");
    const payload = await getPayload({ config });
    const order = (await payload.findByID({ collection: "orders", overrideAccess: true, id: summary.orderId, depth: 0 })) as PayloadDoc | null;
    if (!order) return;

    const email = text(order.customerEmail) || text(session.customer_details?.email) || text(session.customer_email);
    const metadata = (session.metadata || {}) as Record<string, string | undefined>;
    const couponCode = text(metadata.couponCode);
    const giftCode = text(metadata.giftCode);
    const bpgCode = text(metadata.bpgCode) || (isBpg(giftCode) ? giftCode : undefined);
    const discountTotal = number(order.discountTotal);
    const tags = ["customer"];
    if (couponCode || discountTotal > 0) tags.push("coupon-user");
    if (bpgCode) tags.push("bpg-gift-code-user");

    const carts = (await payload.find({
      collection: "abandoned-carts",
      overrideAccess: true,
      limit: 1,
      where: { stripeCheckoutSessionId: { equals: session.id } }
    })) as PayloadFindResult;
    const cart = carts.docs?.[0];
    const recoveredCart = Boolean(cart?.abandonedAt);

    await payload.update({
      collection: "orders",
      overrideAccess: true,
      id: order.id,
      data: {
        couponCode: couponCode || order.couponCode,
        giftCode: giftCode || order.giftCode,
        bpgCode: bpgCode || order.bpgCode,
        recoveredCart,
        sourceCart: cart?.id || order.sourceCart
      }
    });

    if (email) {
      await upsertSubscriber({
        email,
        tags,
        customAttributes: {
          acquiredVia: "purchase",
          orderNumber: summary.orderNumber,
          orderId: summary.orderId,
          discountTotal,
          couponUsed: Boolean(couponCode || discountTotal > 0),
          couponCode,
          giftCode,
          bpgCode,
          recoveredCart,
          cartStatus: "converted",
          cartRecoveryEligible: false
        }
      }).catch(() => null);
    }

    if (!cart) return;

    const priorMetadata = typeof cart.metadata === "object" && cart.metadata ? (cart.metadata as Record<string, unknown>) : {};
    await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: {
        couponCode: couponCode || cart.couponCode,
        giftCode: giftCode || cart.giftCode,
        bpgCode: bpgCode || cart.bpgCode,
        recoveredOrderNumber: recoveredCart ? summary.orderNumber : cart.recoveredOrderNumber,
        recoveredRevenue: recoveredCart ? number(order.total) : cart.recoveredRevenue,
        metadata: {
          ...priorMetadata,
          attributionSyncedAt: new Date().toISOString(),
          couponUsed: Boolean(couponCode || discountTotal > 0),
          discountTotal,
          orderNumber: summary.orderNumber,
          recoveredCart
        }
      }
    });
  } catch (error) {
    console.error("Purchase attribution sync failed", { sessionId: session.id, error });
  }
}
