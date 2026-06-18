import config from "@payload-config";
import { getPayload } from "payload";
import { type DashboardRange, dashboardRangeWindow } from "@/lib/dashboardRanges";

export type DashboardChartOrder = {
  createdAt: string | null;
  status: string;
  total: number;
  podCount: number;
  digitalDownloadCount: number;
};

export type DashboardStatData = {
  label: string;
  value: string;
  note: string;
  trend: string;
  icon: "revenue" | "orders" | "items" | "subscribers";
};

export type DashboardRecentOrder = {
  id: string;
  href: string;
  orderId: string;
  customerName: string;
  status: string;
  tone: string;
  total: string;
  created: string;
};

export type DashboardRecentSubscriber = {
  id: string;
  href: string;
  name: string;
  email: string;
  dateJoined: string;
  status: string;
};

export type DashboardFunnelItem = {
  label: string;
  value: number;
  width: number;
};

export type DashboardAnalyticsData = {
  range: DashboardRange;
  stats: DashboardStatData[];
  chartOrders: DashboardChartOrder[];
  recentOrders: DashboardRecentOrder[];
  latestSubscribers: DashboardRecentSubscriber[];
  funnel: DashboardFunnelItem[];
};

type PayloadDoc = { id?: string | number; createdAt?: string; [key: string]: unknown };
type PayloadResult = { docs?: PayloadDoc[]; totalDocs?: number };

function getString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function getRelationshipId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const object = getObject(value);
  const id = object?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : "";
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(value);
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatShortDate(value: unknown) {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function customerName(order: PayloadDoc) {
  const customer = getObject(order.customer);
  if (customer) {
    const fullName = [getString(customer.firstName), getString(customer.lastName)].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    const email = getString(customer.email);
    if (email) return email.split("@")[0];
  }
  const email = getString(order.customerEmail, "Customer");
  return email.includes("@") ? email.split("@")[0] : email;
}

function subscriberName(subscriber: PayloadDoc) {
  const fullName = [getString(subscriber.firstName), getString(subscriber.lastName)].filter(Boolean).join(" ").trim();
  return fullName || "Subscriber";
}

function statusLabel(status: string) {
  const clean = status || "pending";
  if (["paid", "fulfilled", "complete", "completed", "shipped"].includes(clean.toLowerCase())) return "Complete";
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

function statusTone(status: string) {
  const clean = status.toLowerCase();
  if (["paid", "fulfilled", "complete", "completed", "shipped"].includes(clean)) return "success";
  if (["pending", "processing"].includes(clean)) return "pending";
  if (["refunded", "canceled", "cancelled"].includes(clean)) return "muted";
  return "neutral";
}

function isCompletedSale(status: string) {
  return ["paid", "fulfilled", "complete", "completed", "shipped"].includes(status.toLowerCase());
}

function itemRollups(items: PayloadDoc[], includedOrderIds: Set<string>) {
  const rollups = new Map<string, { podCount: number; digitalDownloadCount: number; totalItems: number }>();
  items.forEach((item) => {
    const id = getRelationshipId(item.order);
    if (!id || !includedOrderIds.has(id)) return;
    const rollup = rollups.get(id) || { podCount: 0, digitalDownloadCount: 0, totalItems: 0 };
    const format = getString(item.format).toLowerCase();
    const quantity = Math.max(1, getNumber(item.quantity) || 1);
    rollup.totalItems += quantity;
    if (["paperback", "hardcover"].includes(format)) rollup.podCount += quantity;
    if (["digital", "audiobook", "audio", "pdf", "epub"].includes(format)) rollup.digitalDownloadCount += quantity;
    rollups.set(id, rollup);
  });
  return rollups;
}

function buildFunnel(totalOrders: number, pendingOrders: number, completedOrders: number, subscribers: number, itemCount: number): DashboardFunnelItem[] {
  const purchased = completedOrders;
  const checkout = Math.max(totalOrders, purchased);
  const addToCart = Math.max(checkout + pendingOrders, itemCount, purchased);
  const visitors = Math.max(addToCart * 4, subscribers * 3, 1);
  const max = Math.max(visitors, addToCart, checkout, purchased, 1);
  return [
    { label: "Visitors", value: visitors, width: Math.max(8, Math.round((visitors / max) * 100)) },
    { label: "Add-to-Cart", value: addToCart, width: Math.max(8, Math.round((addToCart / max) * 100)) },
    { label: "Checkout", value: checkout, width: Math.max(8, Math.round((checkout / max) * 100)) },
    { label: "Purchased", value: purchased, width: Math.max(8, Math.round((purchased / max) * 100)) }
  ];
}

async function findRangeData(collection: string, range: DashboardRange, options: Record<string, unknown> = {}) {
  const payload = await getPayload({ config });
  const { start, end } = dashboardRangeWindow(range);
  return payload.find({
    collection,
    overrideAccess: true,
    limit: 1000,
    sort: "-createdAt",
    where: {
      createdAt: {
        greater_than_equal: start.toISOString(),
        less_than_equal: end.toISOString()
      }
    },
    ...options
  } as never) as Promise<PayloadResult>;
}

export async function getDashboardAnalytics(range: DashboardRange): Promise<DashboardAnalyticsData> {
  const payload = await getPayload({ config });
  const [ordersResult, subscribersResult] = await Promise.all([
    findRangeData("orders", range, { depth: 1 }),
    findRangeData("subscribers", range, { depth: 0 })
  ]);

  const orders = Array.isArray(ordersResult.docs) ? ordersResult.docs : [];
  const subscribers = Array.isArray(subscribersResult.docs) ? subscribersResult.docs : [];
  const orderIds = new Set(orders.map((order) => typeof order.id === "string" || typeof order.id === "number" ? String(order.id) : "").filter(Boolean));
  const orderItemsResult = (await payload.find({ collection: "order-items", overrideAccess: true, depth: 1, limit: 2500, sort: "-createdAt" } as never)) as PayloadResult;
  const orderItems = Array.isArray(orderItemsResult.docs) ? orderItemsResult.docs : [];
  const rollups = itemRollups(orderItems, orderIds);
  const completedOrders = orders.filter((order) => isCompletedSale(getString(order.status)));
  const pendingOrders = orders.filter((order) => ["pending", "processing"].includes(getString(order.status).toLowerCase()));
  const totalRevenue = completedOrders.reduce((sum, order) => sum + getNumber(order.total), 0);
  const totalItems = Array.from(rollups.values()).reduce((sum, rollup) => sum + rollup.totalItems, 0);

  const stats: DashboardStatData[] = [
    { label: "Total Revenue", value: formatMoney(totalRevenue), note: "Paid sales in selected period", trend: `${completedOrders.length} paid`, icon: "revenue" },
    { label: "Orders", value: String(orders.length), note: "Orders created in selected period", trend: `${pendingOrders.length} pending`, icon: "orders" },
    { label: "Items Sold", value: String(totalItems), note: "Order-item quantity in selected period", trend: `${rollups.size} order(s) with items`, icon: "items" },
    { label: "Subscribers", value: String(subscribers.length), note: "New contacts in selected period", trend: `${subscribers.filter((subscriber) => !getString(subscriber.unsubscribedAt)).length} active`, icon: "subscribers" }
  ];

  const recentOrders: DashboardRecentOrder[] = orders.slice(0, 5).map((order) => {
    const rawStatus = getString(order.status, "pending");
    const recordId = typeof order.id === "string" || typeof order.id === "number" ? String(order.id) : "";
    return {
      id: recordId || getString(order.orderNumber, "—"),
      href: recordId ? `/admin/collections/orders/${recordId}` : "/admin/collections/orders",
      orderId: getString(order.orderNumber, recordId || "—"),
      customerName: customerName(order),
      status: statusLabel(rawStatus),
      tone: statusTone(rawStatus),
      total: formatMoney(getNumber(order.total)),
      created: formatDate(order.createdAt)
    };
  });

  const latestSubscribers: DashboardRecentSubscriber[] = subscribers.slice(0, 5).map((subscriber) => {
    const id = typeof subscriber.id === "string" || typeof subscriber.id === "number" ? String(subscriber.id) : getString(subscriber.email, "subscriber");
    const unsubscribed = Boolean(getString(subscriber.unsubscribedAt));
    return {
      id,
      href: `/admin/collections/subscribers/${id}`,
      name: subscriberName(subscriber),
      email: getString(subscriber.email, "—"),
      dateJoined: formatShortDate(subscriber.createdAt),
      status: unsubscribed ? "Unsubscribed" : "Active"
    };
  });

  const chartOrders: DashboardChartOrder[] = orders.map((order) => {
    const id = typeof order.id === "string" || typeof order.id === "number" ? String(order.id) : "";
    const rollup = rollups.get(id) || { podCount: 0, digitalDownloadCount: 0, totalItems: 0 };
    return {
      createdAt: getString(order.createdAt, "") || null,
      status: getString(order.status),
      total: getNumber(order.total),
      podCount: rollup.podCount,
      digitalDownloadCount: rollup.digitalDownloadCount
    };
  });

  return {
    range,
    stats,
    chartOrders,
    recentOrders,
    latestSubscribers,
    funnel: buildFunnel(orders.length, pendingOrders.length, completedOrders.length, subscribers.length, totalItems)
  };
}
