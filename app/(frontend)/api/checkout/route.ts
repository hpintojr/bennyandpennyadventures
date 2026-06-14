import { NextResponse } from "next/server";
import { buildOrderMetadata, validateCheckoutItems } from "@/lib/stripeCheckout";
import { getSiteUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  items?: unknown;
};

export async function POST(request: Request) {
  let body: CheckoutRequestBody;

  try {
    body = (await request.json()) as CheckoutRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  if (!Array.isArray(body.items)) {
    return NextResponse.json({ error: "Cart items are required." }, { status: 400 });
  }

  const items = validateCheckoutItems(body.items);

  if (!items.length) {
    return NextResponse.json({ error: "No valid cart items were found." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_creation: "if_required",
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.unitAmount,
          product_data: {
            name: item.title,
            description: item.formatLabel,
            metadata: {
              slug: item.slug,
              format: item.shortLabel
            }
          }
        }
      })),
      metadata: buildOrderMetadata(items),
      success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?checkout=cancelled`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed", error);
    return NextResponse.json({ error: "Stripe checkout is not ready yet." }, { status: 500 });
  }
}
