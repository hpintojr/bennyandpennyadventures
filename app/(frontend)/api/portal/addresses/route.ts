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

function getEmail(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return getEmail(value).toLowerCase();
}

function getText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function emailConditions(rawEmail: string, userEmail: string) {
  if (!rawEmail) return [];
  return [
    { customerEmail: { equals: rawEmail } },
    { customerEmail: { equals: userEmail } },
    { customerEmail: { like: rawEmail } },
    { customerEmail: { like: userEmail } }
  ];
}

function snapshotAddressFromOrder(order: PayloadDoc, type: "billing" | "shipping") {
  const prefix = type === "billing" ? "billingAddress" : "shippingAddress";
  const street1 = getText(order[`${prefix}Line1`]);
  const city = getText(order[`${prefix}City`]);
  const state = getText(order[`${prefix}State`]);
  const postalCode = getText(order[`${prefix}PostalCode`]);
  const country = getText(order[`${prefix}Country`]);

  if (!street1 || !city || !state || !postalCode || !country) return null;

  return {
    id: `${type}-${order.id}`,
    addressType: type,
    fullName: getText(order[`${prefix}Name`]) || getText(order.customerName) || "Customer Address",
    street1,
    street2: getText(order[`${prefix}Line2`]),
    city,
    state,
    postalCode,
    country,
    phone: getText(order.customerPhone),
    isDefaultShipping: type === "shipping",
    source: "order"
  };
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
  const result = (await payload.find({
    collection: "customer-addresses",
    depth: 0,
    limit: 100,
    sort: "-updatedAt",
    where: {
      customer: {
        equals: user.id
      }
    }
  })) as PayloadFindResult;

  const savedAddresses = (result.docs || []).map((address) => ({
    id: address.id,
    addressType: address.addressType,
    fullName: address.fullName,
    company: address.company,
    street1: address.street1,
    street2: address.street2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone,
    isDefaultShipping: address.isDefaultShipping,
    source: "customer-addresses"
  }));

  const orders = (await payload.find({
    collection: "orders",
    depth: 0,
    limit: 100,
    sort: "-createdAt",
    where: {
      or: [
        {
          customer: {
            equals: user.id
          }
        },
        ...emailConditions(rawEmail, userEmail)
      ]
    }
  })) as PayloadFindResult;

  const snapshotAddresses = (orders.docs || []).flatMap((order) => {
    const billing = snapshotAddressFromOrder(order, "billing");
    const shipping = snapshotAddressFromOrder(order, "shipping");
    return [billing, shipping].filter(Boolean);
  });

  const seen = new Set<string>();
  const addresses = [...savedAddresses, ...snapshotAddresses].filter((address) => {
    const key = `${address?.addressType}-${address?.street1}-${address?.postalCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    addresses
  });
}
