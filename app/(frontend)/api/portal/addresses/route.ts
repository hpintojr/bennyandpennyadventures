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

type AddressType = "billing" | "shipping" | "both";

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

async function getSignedInUser() {
  const payload = await getPayloadClient();
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadDoc | null | undefined;
  return { payload, user: user?.id ? user : null };
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

function normalizeType(value: unknown): AddressType {
  if (value === "shipping") return "shipping";
  if (value === "both") return "both";
  return "billing";
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
    company: undefined as string | undefined,
    street1,
    street2: getText(order[`${prefix}Line2`]),
    city,
    state,
    postalCode,
    country,
    phone: getText(order.customerPhone),
    source: "order" as const
  };
}

function serializeSaved(address: PayloadDoc) {
  return {
    id: address.id,
    label: address.label,
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
    isDefaultShipping: Boolean(address.isDefaultShipping),
    isDefaultBilling: Boolean(address.isDefaultBilling),
    lastUsedAt: address.lastUsedAt,
    source: "customer-addresses" as const
  };
}

function buildAddressData(body: Record<string, unknown>) {
  const fullName = getText(body.fullName);
  const street1 = getText(body.street1);
  const city = getText(body.city);
  const state = getText(body.state);
  const postalCode = getText(body.postalCode);
  const country = getText(body.country) || "US";

  const missing = [
    !fullName && "fullName",
    !street1 && "street1",
    !city && "city",
    !state && "state",
    !postalCode && "postalCode"
  ].filter(Boolean) as string[];

  if (missing.length) {
    return { error: `Missing required fields: ${missing.join(", ")}` };
  }

  return {
    data: {
      label: getText(body.label),
      addressType: normalizeType(body.addressType),
      fullName,
      company: getText(body.company),
      street1,
      street2: getText(body.street2),
      city,
      state,
      postalCode,
      country,
      phone: getText(body.phone),
      isDefaultShipping: Boolean(body.isDefaultShipping),
      isDefaultBilling: Boolean(body.isDefaultBilling)
    }
  };
}

// Clears the matching default flag on every other (non-archived) address for this
// customer so only one address is ever the default shipping / billing address.
async function clearOtherDefaults(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  customerId: string | number,
  field: "isDefaultShipping" | "isDefaultBilling",
  keepId: string | number
) {
  await payload.update({
    collection: "customer-addresses",
    where: {
      and: [
        { customer: { equals: customerId } },
        { [field]: { equals: true } },
        { id: { not_equals: keepId } }
      ]
    },
    data: { [field]: false }
  });
}

async function loadOwnedAddress(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  id: string | number,
  customerId: string | number
) {
  try {
    const doc = (await payload.findByID({
      collection: "customer-addresses",
      id,
      depth: 0
    })) as PayloadDoc | null;
    if (!doc) return null;
    const owner = typeof doc.customer === "object" && doc.customer ? (doc.customer as PayloadDoc).id : doc.customer;
    if (String(owner) !== String(customerId)) return null;
    return doc;
  } catch {
    return null;
  }
}

export async function GET() {
  const { payload, user } = await getSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawEmail = getEmail(user.email);
  const userEmail = normalizeEmail(user.email);

  const result = (await payload.find({
    collection: "customer-addresses",
    depth: 0,
    limit: 200,
    sort: "-updatedAt",
    where: {
      and: [{ customer: { equals: user.id } }, { isArchived: { not_equals: true } }]
    }
  })) as PayloadFindResult;

  const addresses = (result.docs || []).map(serializeSaved);

  const savedKeys = new Set(
    addresses.map((address) => `${address.street1}-${address.postalCode}`.toLowerCase())
  );

  const orders = (await payload.find({
    collection: "orders",
    depth: 0,
    limit: 100,
    sort: "-createdAt",
    where: {
      or: [{ customer: { equals: user.id } }, ...emailConditions(rawEmail, userEmail)]
    }
  })) as PayloadFindResult;

  const seenSnapshot = new Set<string>();
  const orderAddresses = (orders.docs || [])
    .flatMap((order) => [snapshotAddressFromOrder(order, "billing"), snapshotAddressFromOrder(order, "shipping")])
    .filter((address): address is NonNullable<typeof address> => Boolean(address))
    .filter((address) => {
      const key = `${address.street1}-${address.postalCode}`.toLowerCase();
      if (savedKeys.has(key) || seenSnapshot.has(key)) return false;
      seenSnapshot.add(key);
      return true;
    });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    addresses,
    orderAddresses
  });
}

export async function POST(request: Request) {
  const { payload, user } = await getSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const built = buildAddressData(body);
  if ("error" in built) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  const created = (await payload.create({
    collection: "customer-addresses",
    data: {
      ...built.data,
      customer: user.id,
      isArchived: false
    }
  })) as PayloadDoc;

  if (built.data.isDefaultShipping) {
    await clearOtherDefaults(payload, user.id, "isDefaultShipping", created.id);
  }
  if (built.data.isDefaultBilling) {
    await clearOtherDefaults(payload, user.id, "isDefaultBilling", created.id);
  }

  return NextResponse.json({ address: serializeSaved(created) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { payload, user } = await getSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const id = body.id as string | number | undefined;
  if (id === undefined || id === null || id === "") {
    return NextResponse.json({ error: "An address id is required." }, { status: 400 });
  }

  const existing = await loadOwnedAddress(payload, id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  // Lightweight action mode: set-default / archive without resubmitting the full form.
  const action = getText(body.action);
  let data: Record<string, unknown>;

  if (action === "archive") {
    data = { isArchived: true, isDefaultShipping: false, isDefaultBilling: false };
  } else if (action === "default-shipping") {
    data = { isDefaultShipping: true };
  } else if (action === "default-billing") {
    data = { isDefaultBilling: true };
  } else {
    const built = buildAddressData(body);
    if ("error" in built) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    data = built.data;
  }

  const updated = (await payload.update({
    collection: "customer-addresses",
    id,
    data
  })) as PayloadDoc;

  if (data.isDefaultShipping === true) {
    await clearOtherDefaults(payload, user.id, "isDefaultShipping", id);
  }
  if (data.isDefaultBilling === true) {
    await clearOtherDefaults(payload, user.id, "isDefaultBilling", id);
  }

  return NextResponse.json({ address: serializeSaved(updated) });
}

// Soft delete: archive rather than destroy so frozen order snapshots are never affected.
export async function DELETE(request: Request) {
  const { payload, user } = await getSignedInUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let id: string | number | null = searchParams.get("id");

  if (!id) {
    try {
      const body = (await request.json()) as Record<string, unknown>;
      id = (body.id as string | number | undefined) ?? null;
    } catch {
      id = null;
    }
  }

  if (id === null || id === "") {
    return NextResponse.json({ error: "An address id is required." }, { status: 400 });
  }

  const existing = await loadOwnedAddress(payload, id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Address not found." }, { status: 404 });
  }

  await payload.update({
    collection: "customer-addresses",
    id,
    data: { isArchived: true, isDefaultShipping: false, isDefaultBilling: false }
  });

  return NextResponse.json({ ok: true, id });
}
