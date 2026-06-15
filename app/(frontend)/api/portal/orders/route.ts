import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

export const runtime = "nodejs";

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = {
  docs?: PayloadDoc[];
};

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function getRelationId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

function getEmail(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return getEmail(value).toLowerCase();
}

export async function GET() {
  const payload = await getPayloadClient();
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadDoc | null | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawEmail = getEmail(user.email);
  const userEmail = normalizeEmail(user.email);
  const emailConditions = rawEmail
    ? [
        {
          customerEmail: {
            equals: rawEmail
          }
        },
        {
          customerEmail: {
            equals: userEmail
          }
        },
        {
          customerEmail: {
            like: rawEmail
          }
        },
        {
          customerEmail: {
            like: userEmail
          }
        }
      ]
    : [];

  const orders = (await payload.find({
    collection: "orders",
    depth: 1,
    limit: 100,
    sort: "-createdAt",
    where: {
      or: [
        {
          customer: {
            equals: user.id
          }
        },
        ...emailConditions
      ]
    }
  })) as PayloadFindResult;

  const orderDocs = orders.docs || [];
  const orderIds = orderDocs.map((order) => order.id);

  const itemsByOrder = new Map<string, PayloadDoc[]>();

  for (const orderId of orderIds) {
    const items = (await payload.find({
      collection: "order-items",
      depth: 1,
      limit: 100,
      where: {
        order: {
          equals: orderId
        }
      }
    })) as PayloadFindResult;

    itemsByOrder.set(String(orderId), items.docs || []);
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    match: {
      userId: user.id,
      email: rawEmail
    },
    orders: orderDocs.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      taxTotal: order.taxTotal,
      shippingTotal: order.shippingTotal,
      discountTotal: order.discountTotal,
      total: order.total,
      currency: order.currency,
      itemCount: order.itemCount,
      itemsSummary: order.itemsSummary,
      createdAt: order.createdAt,
      billingAddressName: order.billingAddressName,
      billingAddressLine1: order.billingAddressLine1,
      billingAddressLine2: order.billingAddressLine2,
      billingAddressCity: order.billingAddressCity,
      billingAddressState: order.billingAddressState,
      billingAddressPostalCode: order.billingAddressPostalCode,
      billingAddressCountry: order.billingAddressCountry,
      shippingAddressName: order.shippingAddressName,
      shippingAddressLine1: order.shippingAddressLine1,
      shippingAddressLine2: order.shippingAddressLine2,
      shippingAddressCity: order.shippingAddressCity,
      shippingAddressState: order.shippingAddressState,
      shippingAddressPostalCode: order.shippingAddressPostalCode,
      shippingAddressCountry: order.shippingAddressCountry,
      customerId: getRelationId(order.customer),
      customerEmail: order.customerEmail,
      items: (itemsByOrder.get(String(order.id)) || []).map((item) => ({
        id: item.id,
        title: item.title,
        format: item.format,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    }))
  });
}
