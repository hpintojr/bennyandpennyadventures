import crypto from "node:crypto";
import config from "@payload-config";
import { getPayload } from "payload";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

type PayloadClient = {
  find: (args: Record<string, unknown>) => Promise<unknown>;
  create: (args: Record<string, unknown>) => Promise<unknown>;
};

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = {
  docs?: PayloadDoc[];
};

type FulfillmentLineItem = {
  title: string;
  slug: string | null;
  format: "digital" | "audiobook" | "paperback" | "hardcover";
  quantity: number;
  unitPrice: number;
  stripePriceId: string | null;
};

type CheckoutSessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null;
    address?: Stripe.Address | null;
  } | null;
};

export type FulfillmentSummary = {
  orderId: string | number;
  orderNumber: string;
  created: boolean;
  orderItemsCreated: number;
  downloadsCreated: number;
  accessGrantsCreated: number;
};

function formatFromStripeLabel(value: string | null | undefined): FulfillmentLineItem["format"] {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "audio" || normalized === "audiobook") return "audiobook";
  if (normalized === "paperback") return "paperback";
  if (normalized === "hardcover") return "hardcover";
  return "digital";
}

function formatForDisplay(format: FulfillmentLineItem["format"]) {
  if (format === "digital") return "PDF / EPUB";
  if (format === "audiobook") return "Audiobook";
  if (format === "paperback") return "Paperback";
  return "Hardcover";
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function centsToDollars(value: number | null | undefined) {
  return Number(((value || 0) / 100).toFixed(2));
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

function getPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (!session.payment_intent) return null;
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent.id;
}

function getCustomerEmail(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.email || session.customer_email || null;
}

function getOrderNumber(session: Stripe.Checkout.Session) {
  const suffix = session.id.slice(-8).toUpperCase();
  return `BP-${session.created}-${suffix}`;
}

function splitName(fullName: string | null | undefined) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: undefined, lastName: undefined };
  if (parts.length === 1) return { firstName: parts[0], lastName: undefined };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) };
}

function formatAddress(address: Stripe.Address | null | undefined) {
  if (!address) return "Not provided";

  const lines = [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
    address.country
  ].filter(Boolean);

  return lines.length ? lines.join("\n") : "Not provided";
}

function getShippingDetails(session: Stripe.Checkout.Session) {
  return (session as CheckoutSessionWithShipping).shipping_details;
}

function buildCustomerSummary(session: Stripe.Checkout.Session) {
  const customer = session.customer_details;
  const shipping = getShippingDetails(session);

  return [
    "Customer Details:",
    `Name: ${customer?.name || "not provided"}`,
    `Email: ${getCustomerEmail(session) || "not provided"}`,
    `Phone: ${customer?.phone || "not provided"}`,
    "",
    "Billing Address:",
    formatAddress(customer?.address),
    "",
    "Shipping Address:",
    shipping?.address ? [`Name: ${shipping.name || "not provided"}`, formatAddress(shipping.address)].join("\n") : "Not collected / not required"
  ].join("\n");
}

function buildPurchasedItemsSummary(items: FulfillmentLineItem[]) {
  if (!items.length) return "Purchased Items:\n- Could not retrieve Stripe line items.";

  return [
    "Purchased Items:",
    ...items.map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      return `- ${item.quantity} x ${item.title} — ${formatForDisplay(item.format)} @ ${money(item.unitPrice)} = ${money(lineTotal)}`;
    })
  ].join("\n");
}

function buildOrderNotes(session: Stripe.Checkout.Session, items: FulfillmentLineItem[]) {
  return [
    buildCustomerSummary(session),
    "",
    buildPurchasedItemsSummary(items),
    "",
    "Stripe Details:",
    `Stripe session: ${session.id}`,
    `Payment intent: ${getPaymentIntentId(session) || "not provided"}`,
    `Subtotal: ${money(centsToDollars(session.amount_subtotal))}`,
    `Tax: ${money(centsToDollars(session.total_details?.amount_tax))}`,
    `Shipping: ${money(centsToDollars(session.total_details?.amount_shipping))}`
  ].join("\n");
}

function lineItemToFulfillmentItem(lineItem: Stripe.LineItem): FulfillmentLineItem {
  const price = lineItem.price;
  const product = price && typeof price.product === "object" && price.product !== null ? price.product : null;
  const metadata = product && "metadata" in product ? product.metadata : undefined;
  const slug = getString(metadata?.slug);
  const format = formatFromStripeLabel(getString(metadata?.format) || lineItem.description || price?.nickname);
  const quantity = Math.max(1, lineItem.quantity || 1);
  const unitAmount = price?.unit_amount ?? Math.round((lineItem.amount_total || 0) / quantity);

  return {
    title: lineItem.description || (product && "name" in product && typeof product.name === "string" ? product.name : "Benny & Penny Book"),
    slug,
    format,
    quantity,
    unitPrice: Number((unitAmount / 100).toFixed(2)),
    stripePriceId: price?.id || null
  };
}

async function getPayloadClient(): Promise<PayloadClient> {
  return (await getPayload({ config })) as unknown as PayloadClient;
}

async function findExistingOrder(payload: PayloadClient, sessionId: string): Promise<PayloadDoc | null> {
  const result = (await payload.find({
    collection: "orders",
    limit: 1,
    where: {
      stripeCheckoutSessionId: {
        equals: sessionId
      }
    }
  })) as PayloadFindResult;

  return result.docs?.[0] || null;
}

async function findOrCreateCustomer(payload: PayloadClient, session: Stripe.Checkout.Session): Promise<PayloadDoc | null> {
  const email = getCustomerEmail(session);
  if (!email) return null;

  const existing = (await payload.find({
    collection: "users",
    limit: 1,
    where: {
      email: {
        equals: email
      }
    }
  })) as PayloadFindResult;

  if (existing.docs?.[0]) return existing.docs[0];

  const { firstName, lastName } = splitName(session.customer_details?.name);

  return (await payload.create({
    collection: "users",
    data: {
      email,
      firstName,
      lastName,
      phone: session.customer_details?.phone || undefined,
      password: crypto.randomBytes(24).toString("base64url"),
      role: "customer"
    }
  })) as PayloadDoc;
}

async function createBillingAddress(payload: PayloadClient, customer: PayloadDoc | null, session: Stripe.Checkout.Session) {
  const address = session.customer_details?.address;
  if (!customer?.id || !address?.line1 || !address.city || !address.state || !address.postal_code || !address.country) return;

  await payload.create({
    collection: "customer-addresses",
    data: {
      customer: customer.id,
      fullName: session.customer_details?.name || getCustomerEmail(session) || "Stripe Customer",
      street1: address.line1,
      street2: address.line2 || undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: session.customer_details?.phone || undefined,
      isDefaultShipping: false
    }
  });
}

async function findBookBySlug(payload: PayloadClient, slug: string | null): Promise<PayloadDoc | null> {
  if (!slug) return null;

  const result = (await payload.find({
    collection: "books",
    limit: 1,
    where: {
      slug: {
        equals: slug
      }
    }
  })) as PayloadFindResult;

  return result.docs?.[0] || null;
}

async function getFulfillmentItems(sessionId: string): Promise<FulfillmentLineItem[]> {
  const stripe = getStripe();
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    expand: ["data.price.product"],
    limit: 100
  });

  return lineItems.data.map(lineItemToFulfillmentItem);
}

async function createOrderItem(
  payload: PayloadClient,
  orderId: string | number,
  book: PayloadDoc | null,
  item: FulfillmentLineItem
) {
  await payload.create({
    collection: "order-items",
    data: {
      order: orderId,
      book: book?.id,
      title: getString(book?.title) || item.title,
      format: item.format,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      stripePriceId: item.stripePriceId
    }
  });
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<FulfillmentSummary> {
  const payload = await getPayloadClient();
  const existingOrder = await findExistingOrder(payload, session.id);
  const orderNumber = getOrderNumber(session);

  if (existingOrder) {
    return {
      orderId: existingOrder.id,
      orderNumber: getString(existingOrder.orderNumber) || orderNumber,
      created: false,
      orderItemsCreated: 0,
      downloadsCreated: 0,
      accessGrantsCreated: 0
    };
  }

  const customerEmail = getCustomerEmail(session);
  if (!customerEmail) {
    throw new Error(`Stripe session ${session.id} does not include a customer email.`);
  }

  const items = await getFulfillmentItems(session.id);
  const customer = await findOrCreateCustomer(payload, session);
  const order = (await payload.create({
    collection: "orders",
    data: {
      orderNumber,
      customer: customer?.id,
      customerEmail,
      status: "paid",
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: getPaymentIntentId(session),
      total: centsToDollars(session.amount_total),
      currency: session.currency || "usd",
      notes: buildOrderNotes(session, items)
    }
  })) as PayloadDoc;

  try {
    await createBillingAddress(payload, customer, session);
  } catch (error) {
    console.error("Stripe fulfillment billing address table write failed; order was still created", error);
  }

  let orderItemsCreated = 0;

  for (const item of items) {
    try {
      const book = await findBookBySlug(payload, item.slug);
      await createOrderItem(payload, order.id, book, item);
      orderItemsCreated += 1;
    } catch (error) {
      console.error("Stripe fulfillment order item creation failed; order was still created", error);
    }
  }

  return {
    orderId: order.id,
    orderNumber,
    created: true,
    orderItemsCreated,
    downloadsCreated: 0,
    accessGrantsCreated: 0
  };
}

export async function fulfillCheckoutSessionById(sessionId: string): Promise<FulfillmentSummary> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error(`Stripe session ${sessionId} is not paid yet.`);
  }

  return fulfillCheckoutSession(session);
}
