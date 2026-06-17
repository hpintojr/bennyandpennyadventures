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
  totalDocs?: number;
};

type PhysicalFormat = "paperback" | "hardcover";

export type PrintJobCreationSummary = {
  created: number;
  skipped: number;
};

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown, fallback = 1) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getRelationId(value: unknown): string | number | null {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

function getRelationObject(value: unknown): PayloadDoc | null {
  return value && typeof value === "object" && "id" in value ? value as PayloadDoc : null;
}

function isPhysicalFormat(value: unknown): value is PhysicalFormat {
  return value === "paperback" || value === "hardcover";
}

function hasRequiredShipping(order: PayloadDoc) {
  return Boolean(
    getString(order.shippingAddressName) &&
      getString(order.shippingAddressLine1) &&
      getString(order.shippingAddressCity) &&
      getString(order.shippingAddressState) &&
      getString(order.shippingAddressPostalCode) &&
      getString(order.shippingAddressCountry)
  );
}

function hasBookPrintReady(book: PayloadDoc | null, format: PhysicalFormat) {
  if (!book) return false;
  if (format === "paperback") return book.paperbackPrintReady === true;
  return book.hardcoverPrintReady === true;
}

function printJobTitle(order: PayloadDoc, item: PayloadDoc, format: PhysicalFormat) {
  const orderNumber = getString(order.orderNumber) || String(order.id);
  const title = getString(item.title) || "Book";
  return `${orderNumber} — ${title} — ${format}`;
}

async function findPhysicalOrderItems(payload: PayloadClient, orderId: string | number): Promise<PayloadDoc[]> {
  const result = (await payload.find({
    collection: "order-items",
    depth: 1,
    limit: 500,
    where: {
      order: {
        equals: orderId
      }
    }
  })) as PayloadFindResult;

  return (result.docs || []).filter((item) => isPhysicalFormat(item.format));
}

async function existingPrintJobForOrderItem(payload: PayloadClient, orderItemId: string | number): Promise<PayloadDoc | null> {
  const result = (await payload.find({
    collection: "print-jobs",
    limit: 1,
    where: {
      orderItem: {
        equals: orderItemId
      }
    }
  })) as PayloadFindResult;

  return result.docs?.[0] || null;
}

function notesForJob(order: PayloadDoc, book: PayloadDoc | null, format: PhysicalFormat) {
  const notes = ["Phase 1 dry-run print job. LuLu API was not called."];

  if (!hasRequiredShipping(order)) {
    notes.push("Missing complete shipping snapshot. Keep in draft until the address is corrected.");
  }

  if (!book) {
    notes.push("Order detail is not linked to a product catalog record.");
  } else if (!hasBookPrintReady(book, format)) {
    notes.push(`Missing ${format} print-ready metadata on the product catalog record.`);
  }

  return notes.join("\n");
}

export async function createPrintJobsForOrder(payload: PayloadClient, order: PayloadDoc): Promise<PrintJobCreationSummary> {
  const items = await findPhysicalOrderItems(payload, order.id);
  let created = 0;
  let skipped = 0;

  for (const item of items) {
    const orderItemId = item.id;
    const format = item.format;
    if (!isPhysicalFormat(format)) {
      skipped += 1;
      continue;
    }

    const existing = await existingPrintJobForOrderItem(payload, orderItemId);
    if (existing) {
      skipped += 1;
      continue;
    }

    const book = getRelationObject(item.book);
    const bookId = getRelationId(item.book);
    const ready = hasRequiredShipping(order) && hasBookPrintReady(book, format);

    await payload.create({
      collection: "print-jobs",
      data: {
        title: printJobTitle(order, item, format),
        order: order.id,
        orderItem: orderItemId,
        book: bookId || undefined,
        provider: "lulu",
        format,
        quantity: Math.max(1, getNumber(item.quantity, 1)),
        status: ready ? "ready" : "draft",
        customerName: getString(order.customerName) || undefined,
        customerEmail: getString(order.customerEmail) || undefined,
        shippingName: getString(order.shippingAddressName) || undefined,
        shippingLine1: getString(order.shippingAddressLine1) || undefined,
        shippingLine2: getString(order.shippingAddressLine2) || undefined,
        shippingCity: getString(order.shippingAddressCity) || undefined,
        shippingState: getString(order.shippingAddressState) || undefined,
        shippingPostalCode: getString(order.shippingAddressPostalCode) || undefined,
        shippingCountry: getString(order.shippingAddressCountry) || undefined,
        notes: notesForJob(order, book, format)
      }
    });

    created += 1;
  }

  return { created, skipped };
}
