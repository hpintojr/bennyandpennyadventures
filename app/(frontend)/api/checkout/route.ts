import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { buildOrderMetadata, cartRequiresShipping, validateCheckoutItems } from "@/lib/stripeCheckout";
import { getSiteUrl, getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  items?: unknown;
};

const shippingCountries: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = ["US"];

function automaticTaxEnabled() {
  return process.env.STRIPE_AUTOMATIC_TAX_ENABLED === "true";
}

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
    const requiresShipping = cartRequiresShipping(items);
    const useAutomaticTax = automaticTaxEnabled();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      automatic_tax: {
        enabled: useAutomaticTax
      },
      billing_address_collection: "required",
      customer_creation: "always",
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          tax_behavior: useAutomaticTax ? "exclusive" : "unspecified",
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
      phone_number_collection: {
        enabled: true
      },
      shipping_address_collection: requiresShipping
        ? {
            allowed_countries: shippingCountries
          }
        : undefined,
      success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?checkout=cancelled`
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed", error);
    return NextResponse.json({ error: "Stripe checkout is not ready yet." }, { status: 500 });
  }
}
