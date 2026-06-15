import crypto from "node:crypto";
import { getPayload } from "payload";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

type PayloadClient = {
  find: (args: Record<string, unknown>) => Promise<unknown>;
  create: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = {
  docs?: PayloadDoc[];
  totalDocs?: number;
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

type AddressType = "billing" | "shipping";

export type FulfillmentSummary = {
  orderId: string | number;
  orderNumber: string;
  created: boolean;
  orderItemsCreated: number;
  downloadsCreated: number;
  accessGrantsCreated: number;
};

const formatLabels: Record<FulfillmentLineItem["format"], string> = {
  digital: "PDF / EPUB",
  audiobook: "Audiobook",
  paperback: "Paperback",
  hardcover: "Hardcover"
};

function formatFromStripeLabel(value: string | null | undefined): FulfillmentLineItem["format"] {
  const normalized = (value || "").trim().toLowerCase();

  if (normalized === "audio" || normalized === "audiobook") return "audiobook";
  if (normalized === "paperback") return "paperback";
  if (normalized === "hardcover") return "hardcover";
  return "digital";
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getRelationId(value: unknown): string | number | null {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

function centsToDollars(value: number | null | undefined) {
  return Number(((value || 0) / 100).toFixed(2));
}

function getPaymentIntentId(session: Stripe.Checkout.Session): string | null {
  if (!session.payment_intent) return null;
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent.id;
}

function getStripeCustomerId(session: Stripe.Checkout.Session): string | null {
  if (!session.customer) return null;
  if (typeof session.customer === "string") return session.customer;
  return session.customer.id;
}

function getCustomerEmail(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.email || session.customer_email || null;
}

function getOrderPrefix() {
  return String(new Date().getFullYear()).slice(-2);
}

function splitName(fullName: string | null | undefined) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: undefined, lastName: undefined };
  if (parts.length === 1) return { firstName: parts[0], lastName: undefined };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) };
}

function getItemCount(items: FulfillmentLineItem[]) {
  return items.reduce((count, item) => count + item.quantity, 0);
}

function getItemsSummary(items: FulfillmentLineItem[]) {
  return items
    .map((item) => `${item.title} — ${formatLabels[item.format]} × ${item.quantity}`)
    .join("\n");
}

function buildInternalOrderNote(items: FulfillmentLineItem[]) {
  const summary = getItemsSummary(items);
  return summary
    ? `Stripe Checkout fulfilled. Purchased items are also stored as Order Details.\n\n${summary}`
    : "Stripe Checkout fulfilled. Purchased items are stored as Order Details.";
}

function getShippingDetails(session: Stripe.Checkout.Session) {
  return (session as CheckoutSessionWithShipping).shipping_details;
}

async function retrieveCheckoutSessionForFulfillment(session: Stripe.Checkout.Session) {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(session.id, {
    expand: ["customer", "payment_intent"]
  });
}

function getOrderSessionData(session: Stripe.Checkout.Session, customer: PayloadDoc | null = null) {
  const shipping = getShippingDetails(session);
  const billingAddress = session.customer_details?.address;
  const shippingAddress = shipping?.address;
  const data: Record<string, unknown> = {
    customerName: session.customer_details?.name || undefined,
    customerEmail: getCustomerEmail(session) || undefined,
    customerPhone: session.customer_details?.phone || undefined,
    status: "paid",
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: getPaymentIntentId(session),
    stripeCustomerId: getStripeCustomerId(session),
    subtotal: centsToDollars(session.amount_subtotal),
    taxTotal: centsToDollars(session.total_details?.amount_tax),
    shippingTotal: centsToDollars(session.total_details?.amount_shipping),
    discountTotal: centsToDollars(session.total_details?.amount_discount),
    total: centsToDollars(session.amount_total),
    currency: session.currency || "usd",
    billingAddressName: session.customer_details?.name || undefined,
    billingAddressLine1: billingAddress?.line1 || undefined,
    billingAddressLine2: billingAddress?.line2 || undefined,
    billingAddressCity: billingAddress?.city || undefined,
    billingAddressState: billingAddress?.state || undefined,
    billingAddressPostalCode: billingAddress?.postal_code || undefined,
    billingAddressCountry: billingAddress?.country || undefined,
    shippingAddressName: shipping?.name || undefined,
    shippingAddressLine1: shippingAddress?.line1 || undefined,
    shippingAddressLine2: shippingAddress?.line2 || undefined,
    shippingAddressCity: shippingAddress?.city || undefined,
    shippingAddressState: shippingAddress?.state || undefined,
    shippingAddressPostalCode: shippingAddress?.postal_code || undefined,
    shippingAddressCountry: shippingAddress?.country || undefined
  };

  if (customer?.id) data.customer = customer.id;

  return data;
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
  const { default: config } = await import("@payload-config");
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

async function updateExistingOrderFromSession(payload: PayloadClient, order: PayloadDoc, session: Stripe.Checkout.Session, customer: PayloadDoc | null) {
  await payload.update({
    collection: "orders",
    id: order.id,
    data: getOrderSessionData(session, customer)
  });
}

async function getNextOrderNumber(payload: PayloadClient) {
  const prefix = getOrderPrefix();
  const result = (await payload.find({
    collection: "orders",
    limit: 1000,
    sort: "-createdAt"
  })) as PayloadFindResult;

  const sequencePattern = new RegExp(`^${prefix}-(\\d+)$`);
  const maxSequence = (result.docs || []).reduce((max, order) => {
    const orderNumber = getString(order.orderNumber);
    const match = orderNumber?.match(sequencePattern);
    if (!match) return max;
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);

  return `${prefix}-${String(maxSequence + 1).padStart(4, "0")}`;
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

async function findExistingAddress(payload: PayloadClient, customerId: string | number, address: Stripe.Address, addressType: AddressType) {
  const result = (await payload.find({
    collection: "customer-addresses",
    limit: 1,
    where: {
      and: [
        { customer: { equals: customerId } },
        { addressType: { equals: addressType } },
        { street1: { equals: address.line1 } },
        { postalCode: { equals: address.postal_code } },
        { country: { equals: address.country } }
      ]
    }
  })) as PayloadFindResult;

  return result.docs?.[0] || null;
}

async function createCustomerAddress(
  payload: PayloadClient,
  customer: PayloadDoc | null,
  addressType: AddressType,
  fullName: string | null | undefined,
  phone: string | null | undefined,
  address: Stripe.Address | null | undefined
) {
  if (!customer?.id || !address?.line1 || !address.city || !address.state || !address.postal_code || !address.country) return;

  const existingAddress = await findExistingAddress(payload, customer.id, address, addressType);
  if (existingAddress) return;

  await payload.create({
    collection: "customer-addresses",
    data: {
      addressType,
      customer: customer.id,
      fullName: fullName || getString(customer.email) || "Stripe Customer",
      street1: address.line1,
      street2: address.line2 || undefined,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: phone || undefined,
      isDefaultShipping: addressType === "shipping"
    }
  });
}

async function createCheckoutAddresses(payload: PayloadClient, customer: PayloadDoc | null, session: Stripe.Checkout.Session) {
  await createCustomerAddress(
    payload,
    customer,
    "billing",
    session.customer_details?.name,
    session.customer_details?.phone,
    session.customer_details?.address
  );

  const shipping = getShippingDetails(session);

  if (shipping?.address) {
    await createCustomerAddress(
      payload,
      customer,
      "shipping",
      shipping.name,
      session.customer_details?.phone,
      shipping.address
    );
  }
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
  const fulfillmentSession = await retrieveCheckoutSessionForFulfillment(session);
  const existingOrder = await findExistingOrder(payload, fulfillmentSession.id);

  if (existingOrder) {
    const existingCustomerId = getRelationId(existingOrder.customer);
    const existingCustomer = existingCustomerId ? { id: existingCustomerId, email: existingOrder.customerEmail } : await findOrCreateCustomer(payload, fulfillmentSession);

    await updateExistingOrderFromSession(payload, existingOrder, fulfillmentSession, existingCustomer);

    try {
      await createCheckoutAddresses(payload, existingCustomer, fulfillmentSession);
    } catch (error) {
      console.error("Stripe fulfillment address table backfill failed; existing order was still updated", error);
    }

    return {
      orderId: existingOrder.id,
      orderNumber: getString(existingOrder.orderNumber) || String(existingOrder.id),
      created: false,
      orderItemsCreated: 0,
      downloadsCreated: 0,
      accessGrantsCreated: 0
    };
  }

  const customerEmail = getCustomerEmail(fulfillmentSession);

  if (!customerEmail) {
    throw new Error(`Stripe session ${session.id} does not include a customer email.`);
  }

  const orderNumber = await getNextOrderNumber(payload);
  const items = await getFulfillmentItems(fulfillmentSession.id);
  const itemCount = getItemCount(items);
  const itemsSummary = getItemsSummary(items);
  const customer = await findOrCreateCustomer(payload, fulfillmentSession);

  const order = (await payload.create({
    collection: "orders",
    data: {
      orderNumber,
      customer: customer?.id,
      ...getOrderSessionData(fulfillmentSession, customer),
      itemCount,
      itemsSummary,
      notes: buildInternalOrderNote(items)
    }
  })) as PayloadDoc;

  try {
    await createCheckoutAddresses(payload, customer, fulfillmentSession);
  } catch (error) {
    console.error("Stripe fulfillment address table write failed; order was still created", error);
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
