import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPayload } from "payload";
import { buildOrderMetadata, cartRequiresShipping, validateCheckoutItems } from "@/lib/stripeCheckout";
import { getSiteUrl, getStripe } from "@/lib/stripe";
import { upsertSubscriber } from "@/lib/email";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  items?: unknown;
  shippingAddressId?: unknown;
  billingAddressId?: unknown;
  cartToken?: unknown;
  email?: unknown;
  marketingConsent?: unknown;
  couponCode?: unknown;
  giftCode?: unknown;
  bpgCode?: unknown;
};

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = { docs?: PayloadDoc[] };

const shippingCountries: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] = ["US"];

function automaticTaxEnabled() {
  return process.env.STRIPE_AUTOMATIC_TAX_ENABLED === "true";
}

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function getText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getEmail(value: unknown) {
  const email = getText(value)?.toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

function getId(value: unknown): string | number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function code(value: unknown) {
  return getText(value)?.slice(0, 80);
}

// Loads a customer-addresses doc only if it belongs to the signed-in customer.
async function loadOwnedAddress(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  id: string | number,
  customerId: string | number
): Promise<PayloadDoc | null> {
  try {
    const doc = (await payload.findByID({ collection: "customer-addresses", id, depth: 0 })) as PayloadDoc | null;
    if (!doc) return null;
    const owner = typeof doc.customer === "object" && doc.customer ? (doc.customer as PayloadDoc).id : doc.customer;
    if (String(owner) !== String(customerId)) return null;
    if (doc.isArchived === true) return null;
    return doc;
  } catch {
    return null;
  }
}

function toStripeAddress(address: PayloadDoc): Stripe.AddressParam | undefined {
  const line1 = getText(address.street1);
  const city = getText(address.city);
  const state = getText(address.state);
  const postalCode = getText(address.postalCode);
  const country = getText(address.country);
  if (!line1 || !city || !state || !postalCode || !country) return undefined;
  return {
    line1,
    line2: getText(address.street2),
    city,
    state,
    postal_code: postalCode,
    country
  };
}

async function findCart(payload: Awaited<ReturnType<typeof getPayloadClient>>, cartToken: string) {
  const result = (await payload.find({ collection: "abandoned-carts", limit: 1, where: { cartToken: { equals: cartToken } } })) as PayloadFindResult;
  return result.docs?.[0] || null;
}

async function markCheckoutStarted(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  args: {
    cartToken?: string;
    email?: string;
    customerId?: string | number;
    stripeCheckoutSessionId: string;
    stripeCustomerId?: string;
    marketingConsent?: boolean;
    couponCode?: string;
    giftCode?: string;
    bpgCode?: string;
  }
) {
  if (!args.cartToken) return;
  const existing = await findCart(payload, args.cartToken);
  const now = new Date().toISOString();
  const tags = ["ecommerce.in_checkout"];
  if (args.couponCode) tags.push("coupon-user");
  if (args.bpgCode || /^BPG/i.test(args.giftCode || "")) tags.push("bpg-gift-code-user");

  if (args.email && (args.marketingConsent || args.customerId)) {
    await upsertSubscriber({
      email: args.email,
      tags,
      customAttributes: { acquiredVia: "checkout", cartToken: args.cartToken, couponCode: args.couponCode, giftCode: args.giftCode, bpgCode: args.bpgCode }
    }).catch(() => null);
  }

  const data: Record<string, unknown> = {
    email: args.email || existing?.email,
    customer: args.customerId || existing?.customer,
    status: existing?.status === "converted" ? "converted" : "checkout-started",
    cartToken: args.cartToken,
    stripeCheckoutSessionId: args.stripeCheckoutSessionId,
    stripeCustomerId: args.stripeCustomerId || existing?.stripeCustomerId,
    marketingConsent: args.marketingConsent || existing?.marketingConsent === true,
    couponCode: args.couponCode || existing?.couponCode,
    giftCode: args.giftCode || existing?.giftCode,
    bpgCode: args.bpgCode || existing?.bpgCode,
    checkoutStartedAt: existing?.checkoutStartedAt || now,
    lastActivityAt: now,
    lastSequenzySyncAt: args.email && (args.marketingConsent || args.customerId) ? now : existing?.lastSequenzySyncAt,
    sequenzyTags: args.email && (args.marketingConsent || args.customerId) ? tags : existing?.sequenzyTags,
    source: "checkout",
    metadata: { ...(typeof existing?.metadata === "object" && existing.metadata ? (existing.metadata as Record<string, unknown>) : {}), checkoutStarted: true }
  };
  if (!existing) data.firstSeenAt = now;

  if (existing) await payload.update({ collection: "abandoned-carts", id: existing.id, data });
  else await payload.create({ collection: "abandoned-carts", data });
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

  const requiresShipping = cartRequiresShipping(items);

  // Resolve a signed-in customer and any chosen saved addresses. All of this is
  // best-effort: guests and signed-in customers without a saved address fall back
  // to Stripe collecting the address fresh.
  let stripeCustomerId: string | undefined;
  let chosenShipping: PayloadDoc | null = null;
  let chosenBilling: PayloadDoc | null = null;
  let customerUserId: string | number | undefined;
  let checkoutEmail = getEmail(body.email);
  const cartToken = getText(body.cartToken);
  const couponCode = code(body.couponCode);
  const giftCode = code(body.giftCode);
  const bpgCode = code(body.bpgCode);
  const marketingConsent = body.marketingConsent === true;
  let payloadForTracking: Awaited<ReturnType<typeof getPayloadClient>> | null = null;

  try {
    const payload = await getPayloadClient();
    payloadForTracking = payload;
    const headers = await getHeaders();
    const auth = await payload.auth({ headers });
    const user = auth.user as PayloadDoc | null | undefined;

    if (user?.id) {
      customerUserId = user.id;
      checkoutEmail = getEmail(user.email) || checkoutEmail;
      const billingId = getId(body.billingAddressId);
      const shippingId = getId(body.shippingAddressId);

      if (billingId) chosenBilling = await loadOwnedAddress(payload, billingId, user.id);
      if (shippingId && requiresShipping) chosenShipping = await loadOwnedAddress(payload, shippingId, user.id);

      if (chosenBilling || chosenShipping) {
        const stripe = getStripe();
        const billingAddress = chosenBilling ? toStripeAddress(chosenBilling) : undefined;
        const shippingAddress = chosenShipping ? toStripeAddress(chosenShipping) : undefined;
        const customerName =
          getText(chosenBilling?.fullName) || getText(chosenShipping?.fullName) || getText(user.email);
        const customerPhone = getText(chosenBilling?.phone) || getText(chosenShipping?.phone);

        const created = await stripe.customers.create({
          email: getText(user.email),
          name: customerName,
          phone: customerPhone,
          address: billingAddress || shippingAddress,
          shipping:
            shippingAddress && customerName
              ? { name: customerName, phone: customerPhone, address: shippingAddress }
              : undefined,
          metadata: { benny_penny_user_id: String(user.id) }
        });
        stripeCustomerId = created.id;
      }
    }
  } catch (error) {
    // Never block checkout because the saved-address lookup failed.
    console.error("Saved-address checkout prefill skipped", error);
  }

  try {
    const stripe = getStripe();
    const siteUrl = getSiteUrl();
    const useAutomaticTax = automaticTaxEnabled();

    const metadata: Record<string, string> = { ...buildOrderMetadata(items) };
    if (customerUserId) metadata.customerUserId = String(customerUserId);
    if (chosenShipping) metadata.shippingAddressId = String(chosenShipping.id);
    if (chosenBilling) metadata.billingAddressId = String(chosenBilling.id);
    if (cartToken) metadata.cartToken = cartToken;
    if (couponCode) metadata.couponCode = couponCode;
    if (giftCode) metadata.giftCode = giftCode;
    if (bpgCode) metadata.bpgCode = bpgCode;

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      allow_promotion_codes: true,
      automatic_tax: { enabled: useAutomaticTax },
      billing_address_collection: "required",
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
      metadata,
      phone_number_collection: { enabled: true },
      shipping_address_collection: requiresShipping ? { allowed_countries: shippingCountries } : undefined,
      success_url: `${siteUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?checkout=cancelled`
    };

    // A Stripe Customer carrying the saved address lets the hosted Checkout page
    // prefill billing/shipping. `customer` and `customer_creation` are mutually
    // exclusive, so only one branch runs.
    if (stripeCustomerId) {
      params.customer = stripeCustomerId;
      params.customer_update = {
        address: "auto",
        name: "auto",
        ...(requiresShipping ? { shipping: "auto" } : {})
      };
    } else {
      if (checkoutEmail) params.customer_email = checkoutEmail;
      params.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(params);

    if (payloadForTracking && cartToken) {
      await markCheckoutStarted(payloadForTracking, {
        cartToken,
        email: checkoutEmail,
        customerId: customerUserId,
        stripeCheckoutSessionId: session.id,
        stripeCustomerId,
        marketingConsent,
        couponCode,
        giftCode,
        bpgCode
      }).catch((error) => console.error("Checkout cart tracking failed", error));
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed", error);
    return NextResponse.json({ error: "Stripe checkout is not ready yet." }, { status: 500 });
  }
}
