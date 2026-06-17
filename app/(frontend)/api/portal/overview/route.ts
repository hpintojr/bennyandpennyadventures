import { NextResponse } from "next/server";
import {
  getPortalAuth,
  customerOrderWhere,
  readablePool,
  shipmentsByOrder,
  fulfillmentSummary,
  relId,
  relTitle,
  str,
  num,
  type PayloadDoc,
  type PayloadFindResult
} from "@/lib/portalData";

export const runtime = "nodejs";

function isExpired(value: unknown) {
  const d = str(value);
  if (!d) return false;
  return new Date(d).getTime() < Date.now();
}

function isActiveRecord(dl: PayloadDoc) {
  return dl.isActive !== false && !isExpired(dl.accessExpiresAt);
}

export async function GET() {
  const { payload, user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Orders
  const orders = (await payload.find({
    collection: "orders",
    depth: 0,
    limit: 100,
    sort: "-createdAt",
    where: customerOrderWhere(user)
  })) as PayloadFindResult;
  const orderDocs = orders.docs || [];
  const orderIds = orderDocs.map((o) => o.id);

  // Order items (single query) → owned-book count
  const ownedBooks = new Set<string>();
  if (orderIds.length) {
    const items = (await payload.find({
      collection: "order-items",
      depth: 0,
      limit: 1000,
      where: { order: { in: orderIds } }
    })) as PayloadFindResult;
    for (const item of items.docs || []) {
      const key = String(relId(item.book) ?? str(item.title) ?? "");
      if (key) ownedBooks.add(key);
    }
  }

  // Downloads → readable slot pool + ready-to-read items
  const downloads = (await payload.find({
    collection: "downloads",
    depth: 1,
    limit: 500,
    where: { customer: { equals: user.id } }
  })) as PayloadFindResult;
  const downloadDocs = downloads.docs || [];

  const readableByBook = new Map<string, PayloadDoc[]>();
  for (const dl of downloadDocs) {
    if (!["pdf", "epub"].includes(str(dl.format) || "")) continue;
    const key = String(relId(dl.book) ?? "");
    if (!readableByBook.has(key)) readableByBook.set(key, []);
    readableByBook.get(key)!.push(dl);
  }

  let totalSlots = 0;
  let usedSlots = 0;
  let giftSlots = 0;
  let remainingSlots = 0;
  const perBook: { title: string; total: number; remaining: number }[] = [];
  for (const list of Array.from(readableByBook.values())) {
    const pool = readablePool(list);
    if (pool.total === null) continue;
    totalSlots += pool.total;
    usedSlots += pool.used;
    giftSlots += pool.gifts;
    remainingSlots += pool.remaining ?? 0;
    perBook.push({
      title: relTitle(list[0]?.book) || str(list[0]?.fileLabel) || "Your book",
      total: pool.total,
      remaining: pool.remaining ?? 0
    });
  }
  perBook.sort((a, b) => a.title.localeCompare(b.title));

  // Ready-to-read items (active, with remaining access)
  const quickReads: { downloadId: string | number; bookTitle: string; format: string; label: string }[] = [];
  for (const list of Array.from(readableByBook.values())) {
    const pool = readablePool(list);
    if ((pool.remaining ?? 0) <= 0) continue;
    for (const dl of list) {
      if (!isActiveRecord(dl)) continue;
      quickReads.push({
        downloadId: dl.id,
        bookTitle: relTitle(dl.book) || "Your book",
        format: str(dl.format) || "file",
        label: (str(dl.format) || "file").toUpperCase()
      });
    }
  }
  for (const dl of downloadDocs) {
    if (str(dl.format) !== "audiobook" || !isActiveRecord(dl)) continue;
    const remaining = num(dl.maxDownloads) - num(dl.downloadsUsed) - num(dl.giftsIssued);
    if (remaining <= 0) continue;
    quickReads.push({ downloadId: dl.id, bookTitle: relTitle(dl.book) || "Your book", format: "audiobook", label: "Audiobook" });
  }

  // Gifts
  const gifts = (await payload.find({
    collection: "gifts",
    depth: 0,
    limit: 200,
    where: { gifter: { equals: user.id } }
  })) as PayloadFindResult;
  const giftDocs = gifts.docs || [];
  const activeGifts = giftDocs.filter((g) => g.status === "sent").length;
  const redeemedGifts = giftDocs.filter((g) => g.status === "redeemed").length;

  // Shipments
  const shipMap = await shipmentsByOrder(payload, orderIds);
  let inTransit = 0;
  let delivered = 0;
  for (const list of Array.from(shipMap.values())) {
    for (const s of list) {
      if (s.stage === "shipped") inTransit += 1;
      if (s.stage === "delivered") delivered += 1;
    }
  }

  const recentOrders = orderDocs.slice(0, 4).map((o) => {
    const shipments = shipMap.get(String(o.id)) || [];
    return {
      id: o.id,
      orderNumber: str(o.orderNumber) || String(o.id),
      status: str(o.status) || "paid",
      total: num(o.total),
      currency: str(o.currency) || "usd",
      createdAt: str(o.createdAt),
      itemsSummary: str(o.itemsSummary),
      fulfillment: fulfillmentSummary(o, shipments),
      hasTracking: shipments.some((s) => Boolean(s.trackingUrl || s.trackingNumber))
    };
  });

  return NextResponse.json({
    user: {
      firstName: str(user.firstName),
      lastName: str(user.lastName),
      email: str(user.email)
    },
    slots: { total: totalSlots, used: usedSlots, gifts: giftSlots, remaining: remainingSlots, perBook },
    counts: {
      books: ownedBooks.size,
      orders: orderDocs.length,
      activeGifts,
      redeemedGifts,
      readyToRead: quickReads.length
    },
    shipments: { inTransit, delivered },
    quickReads: quickReads.slice(0, 5),
    recentOrders
  });
}
