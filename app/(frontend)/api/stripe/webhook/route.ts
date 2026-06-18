import { NextResponse } from "next/server";
import { getPayload } from "payload";
import type Stripe from "stripe";
import { fulfillCheckoutSession } from "@/lib/stripeFulfillment";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

async function markTrackedCartConverted(sessionId: string, orderId?: string | number, orderNumber?: string) {
  try {
    const { default: config } = await import("@payload-config");
    const payload = await getPayload({ config });
    const result = (await payload.find({
      collection: "abandoned-carts",
      overrideAccess: true,
      limit: 1,
      where: { stripeCheckoutSessionId: { equals: sessionId } }
    })) as PayloadFindResult;
    const cart = result.docs?.[0];
    if (!cart) return false;

    const now = new Date().toISOString();
    const metadata = typeof cart.metadata === "object" && cart.metadata ? (cart.metadata as Record<string, unknown>) : {};
    await payload.update({
      collection: "abandoned-carts",
      overrideAccess: true,
      id: cart.id,
      data: {
        status: "converted",
        convertedAt: now,
        lastActivityAt: now,
        metadata: { ...metadata, convertedFromWebhook: true, orderId, orderNumber }
      }
    });
    return true;
  } catch (error) {
    console.error("Stripe webhook cart conversion tracking failed", { sessionId, error });
    return false;
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "/api/stripe/webhook",
    status: "Stripe webhook endpoint is online. Stripe events must be sent as signed POST requests.",
    accepts: ["checkout.session.completed", "payment_intent.payment_failed"]
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const summary = await fulfillCheckoutSession(session);
        const cartConverted = await markTrackedCartConverted(session.id, summary.orderId, summary.orderNumber);
        console.log("Stripe checkout fulfillment completed", {
          eventId: event.id,
          sessionId: session.id,
          cartConverted,
          ...summary
        });
        break;
      }
      case "payment_intent.payment_failed": {
        console.log("Stripe payment failed", event.id);
        break;
      }
      default: {
        console.log(`Unhandled Stripe event: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 400 });
  }
}
