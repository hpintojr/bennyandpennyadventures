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

type BookDoc = PayloadDoc & {
  slug?: string;
  title?: string;
  pdfObjectKey?: string;
  epubObjectKey?: string;
  audiobookObjectKey?: string;
};

type FulfillmentLineItem = {
  title: string;
  slug: string | null;
  format: "digital" | "audiobook" | "paperback" | "hardcover";
  quantity: number;
  unitPrice: number;
  stripePriceId: string | null;
};

export type FulfillmentSummary = {
  orderId: string | number;
  orderNumber: string;
  created: boolean;
  orderItemsCreated: number;
  downloadsCreated: number;
  accessGrantsCreated: number;
};

const DOWNLOAD_LIMIT = 3;
const ACCESS_DAYS = 365;

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

function getOrderNumber(session: Stripe.Checkout.Session) {
  const suffix = session.id.slice(-8).toUpperCase();
  return `BP-${session.created}-${suffix}`;
}

function getAccessExpiresAt() {
  const date = new Date();
  date.setDate(date.getDate() + ACCESS_DAYS);
  return date.toISOString();
}

function stripeAddressToPayloadAddress(
  name: string | null | undefined,
  address: Stripe.Address | null | undefined
) {
  if (!address) return undefined;

  return {
    name: name || undefined,
    line1: address.line1 || undefined,
    line2: address.line2 || undefined,
    city: address.city || undefined,
    state: address.state || undefined,
    postalCode: address.postal_code || undefined,
    country: address.country || undefined
  };
}

function getBillingAddress(session: Stripe.Checkout.Session) {
  return stripeAddressToPayloadAddress(session.customer_details?.name, session.customer_details?.address);
}

function getShippingAddress(_session: Stripe.Checkout.Session) {
  return undefined;
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

async function findOrCreateCustomer(payload: PayloadClient, email: string): Promise<PayloadDoc> {
  const result = (await payload.find({
    collection: "users",
    limit: 1,
    where: {
      email: {
        equals: email
      }
    }
  })) as PayloadFindResult;

  const existingUser = result.docs?.[0];
  if (existingUser) return existingUser;

  return (await payload.create({
    collection: "users",
    data: {
      email,
      password: crypto.randomBytes(24).toString("base64url"),
      role: "customer"
    }
  })) as PayloadDoc;
}

async function findBookBySlug(payload: PayloadClient, slug: string | null): Promise<BookDoc | null> {
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

  return (result.docs?.[0] as BookDoc | undefined) || null;
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
  book: BookDoc | null,
  item: FulfillmentLineItem
) {
  await payload.create({
    collection: "order-items",
    data: {
      order: orderId,
      book: book?.id,
      title: book?.title || item.title,
      format: item.format,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      stripePriceId: item.stripePriceId
    }
  });
}

async function createAccessGrant(
  payload: PayloadClient,
  customerId: string | number,
  book: BookDoc,
  item: FulfillmentLineItem,
  orderNumber: string
) {
  if (item.format !== "digital" && item.format !== "audiobook") return false;

  await payload.create({
    collection: "access-grants",
    data: {
      customer: customerId,
      book: book.id,
      format: item.format,
      maxDownloads: DOWNLOAD_LIMIT,
      expiresAt: getAccessExpiresAt(),
      reason: `Stripe purchase ${orderNumber}`,
      adminNotes: "Created automatically from Stripe checkout.session.completed."
    }
  });

  return true;
}

async function createDownloadRecord(
  payload: PayloadClient,
  customerId: string | number,
  orderId: string | number,
  book: BookDoc,
  format: "pdf" | "epub" | "audiobook",
  objectKey: string,
  label: string
) {
  await payload.create({
    collection: "downloads",
    data: {
      customer: customerId,
      order: orderId,
      book: book.id,
      fileLabel: label,
      format,
      r2ObjectKey: objectKey,
      maxDownloads: DOWNLOAD_LIMIT,
      downloadsUsed: 0,
      accessExpiresAt: getAccessExpiresAt(),
      isActive: true,
      adminNotes: "Created automatically from Stripe checkout.session.completed."
    }
  });
}

async function createDownloadRecords(
  payload: PayloadClient,
  customerId: string | number,
  orderId: string | number,
  book: BookDoc,
  item: FulfillmentLineItem
) {
  let created = 0;

  if (item.format === "digital") {
    if (book.pdfObjectKey) {
      await createDownloadRecord(payload, customerId, orderId, book, "pdf", book.pdfObjectKey, `${book.title || item.title} PDF`);
      created += 1;
    }

    if (book.epubObjectKey) {
      await createDownloadRecord(payload, customerId, orderId, book, "epub", book.epubObjectKey, `${book.title || item.title} EPUB`);
      created += 1;
    }
  }

  if (item.format === "audiobook" && book.audiobookObjectKey) {
    await createDownloadRecord(payload, customerId, orderId, book, "audiobook", book.audiobookObjectKey, `${book.title || item.title} Audiobook`);
    created += 1;
  }

  return created;
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

  const customer = await findOrCreateCustomer(payload, customerEmail);
  const order = (await payload.create({
    collection: "orders",
    data: {
      orderNumber,
      customer: customer.id,
      customerEmail,
      status: "paid",
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: getStripeCustomerId(session),
      stripePaymentIntentId: getPaymentIntentId(session),
      total: centsToDollars(session.amount_total),
      subtotal: centsToDollars(session.amount_subtotal),
      taxTotal: centsToDollars(session.total_details?.amount_tax),
      shippingTotal: centsToDollars(session.total_details?.amount_shipping),
      currency: session.currency || "usd",
      billingAddress: getBillingAddress(session),
      shippingAddress: getShippingAddress(session),
      notes: "Created automatically from Stripe checkout.session.completed."
    }
  })) as PayloadDoc;

  const items = await getFulfillmentItems(session.id);
  let orderItemsCreated = 0;
  let downloadsCreated = 0;
  let accessGrantsCreated = 0;

  for (const item of items) {
    const book = await findBookBySlug(payload, item.slug);
    await createOrderItem(payload, order.id, book, item);
    orderItemsCreated += 1;

    if (book && (await createAccessGrant(payload, customer.id, book, item, orderNumber))) {
      accessGrantsCreated += 1;
      downloadsCreated += await createDownloadRecords(payload, customer.id, order.id, book, item);
    }
  }

  return {
    orderId: order.id,
    orderNumber,
    created: true,
    orderItemsCreated,
    downloadsCreated,
    accessGrantsCreated
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
