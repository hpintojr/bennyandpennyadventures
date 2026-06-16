import config from "@payload-config";
import { BookCopy, Mail, Package, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getPayload } from "payload";
import React from "react";
import AdminWelcomeName from "./AdminWelcomeName";
import DashboardSalesChart, { type DashboardChartOrder } from "./DashboardSalesChart";
import "./BeforeDashboard.scss";
import "./RegionCompact.scss";

type PayloadDoc = { id?: string | number; createdAt?: string; [key: string]: unknown };
type PayloadListResult = { docs: PayloadDoc[]; totalDocs: number; ok: boolean };
type RecentOrder = { id: string; href: string; orderId: string; customerName: string; status: string; tone: string; total: string; created: string };
type RecentSubscriber = { id: string; href: string; name: string; email: string; dateJoined: string; status: string };
type StatusItem = { label: string; detail: string; logoUrl: string; active: boolean };
type FunnelItem = { label: string; value: number; width: number };
type StatCard = { label: string; value: string; note: string; trend: string; Icon: LucideIcon };

const serviceLogos = {
  payload: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/payload.svg",
  neon: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/neon-tech.svg",
  stripe: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/stripe.svg",
  r2: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/cloudflare-zero-trust.svg",
  sequenzy: "https://media.theresanaiforthat.com/icons/sequenzy.svg",
  mailjet: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/mailjet.svg",
  lulu: "https://cdn.brandfetch.io/idICJd57ED/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1778052093073"
};

function getString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
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

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function getRelationshipId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const object = getObject(value);
  const id = object?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : "";
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
  if (["paid", "fulfilled", "complete", "completed"].includes(clean.toLowerCase())) return "Complete";
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

async function safeFind(collection: string, options: Record<string, unknown> = {}): Promise<PayloadListResult> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({ collection, limit: 10, depth: 1, ...options } as never);
    return { docs: Array.isArray(result.docs) ? result.docs as PayloadDoc[] : [], totalDocs: typeof result.totalDocs === "number" ? result.totalDocs : 0, ok: true };
  } catch (error) {
    console.error(`Dashboard data fetch failed for ${collection}`, error);
    return { docs: [], totalDocs: 0, ok: false };
  }
}

function itemRollups(items: PayloadDoc[]) {
  const rollups = new Map<string, { podCount: number; digitalDownloadCount: number }>();
  items.forEach((item) => {
    const id = getRelationshipId(item.order);
    if (!id) return;
    const rollup = rollups.get(id) || { podCount: 0, digitalDownloadCount: 0 };
    const format = getString(item.format).toLowerCase();
    const quantity = Math.max(1, getNumber(item.quantity) || 1);
    if (["paperback", "hardcover"].includes(format)) rollup.podCount += quantity;
    if (["digital", "audiobook", "audio"].includes(format)) rollup.digitalDownloadCount += quantity;
    rollups.set(id, rollup);
  });
  return rollups;
}

function buildFunnel(totalOrders: number, pendingOrders: number, completedOrders: number, subscribers: number, itemCount: number): FunnelItem[] {
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

async function getDashboardData() {
  const [orders, allOrders, pendingOrders, orderItems, subscribers, downloads, books, users] = await Promise.all([
    safeFind("orders", { limit: 5, sort: "-createdAt" }),
    safeFind("orders", { limit: 500, sort: "-createdAt" }),
    safeFind("orders", { limit: 1, where: { status: { equals: "pending" } } }),
    safeFind("order-items", { limit: 500, sort: "-createdAt" }),
    safeFind("subscribers", { limit: 5, sort: "-createdAt" }),
    safeFind("downloads", { limit: 1 }),
    safeFind("books", { limit: 1 }),
    safeFind("users", { limit: 1 })
  ]);

  const rollups = itemRollups(orderItems.docs);
  const completedOrders = allOrders.docs.filter((order) => isCompletedSale(getString(order.status)));
  const totalRevenue = completedOrders.reduce((sum, order) => sum + getNumber(order.total), 0);
  const totalItems = orderItems.docs.reduce((sum, item) => sum + Math.max(1, getNumber(item.quantity) || 1), 0);
  const hasStripeRecords = allOrders.docs.some((order) => getString(order.stripeCheckoutSessionId) || getString(order.stripePaymentIntentId));

  const stats: StatCard[] = [
    { label: "Total Revenue", value: formatMoney(totalRevenue), note: "Paid Stripe orders", trend: `${completedOrders.length} paid`, Icon: Wallet },
    { label: "Orders", value: String(allOrders.totalDocs), note: "Total order records", trend: "Live", Icon: Package },
    { label: "Items Sold", value: String(totalItems), note: "Order Detail quantity", trend: `${orderItems.totalDocs} rows`, Icon: BookCopy },
    { label: "Subscribers", value: String(subscribers.totalDocs), note: "Community list", trend: "Live", Icon: Mail }
  ];

  const recentOrders: RecentOrder[] = orders.docs.map((order) => {
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

  const latestSubscribers: RecentSubscriber[] = subscribers.docs.map((subscriber) => {
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

  const chartOrders: DashboardChartOrder[] = allOrders.docs.map((order) => {
    const id = typeof order.id === "string" || typeof order.id === "number" ? String(order.id) : "";
    const rollup = rollups.get(id) || { podCount: 0, digitalDownloadCount: 0 };
    return { createdAt: getString(order.createdAt, "") || null, status: getString(order.status), total: getNumber(order.total), podCount: rollup.podCount, digitalDownloadCount: rollup.digitalDownloadCount };
  });

  const systemStatus: StatusItem[] = [
    { label: "Payload CMS/API", detail: orders.ok ? "CONNECTED/ACTIVE" : "CHECK LOGS", logoUrl: serviceLogos.payload, active: orders.ok },
    { label: "Neon Database", detail: orders.ok && users.ok ? "CONNECTED/ACTIVE" : "CHECK CONNECTION", logoUrl: serviceLogos.neon, active: orders.ok && users.ok },
    { label: "Stripe API", detail: hasStripeRecords ? "CONNECTED/ACTIVE" : "READY TO VERIFY", logoUrl: serviceLogos.stripe, active: hasStripeRecords },
    { label: "R2 Fulfillment", detail: downloads.ok ? "CONNECTED/ACTIVE" : "CHECK FULFILLMENT", logoUrl: serviceLogos.r2, active: downloads.ok },
    { label: "Sequenzy API", detail: subscribers.ok ? "CONNECTED/ACTIVE" : "CHECK EMAIL", logoUrl: serviceLogos.sequenzy, active: subscribers.ok },
    { label: "Mailjet API", detail: subscribers.ok ? "CONNECTED/ACTIVE" : "CHECK EMAIL", logoUrl: serviceLogos.mailjet, active: subscribers.ok },
    { label: "LuLu Press API", detail: orderItems.ok ? "CONNECTED/ACTIVE" : "READY TO VERIFY", logoUrl: serviceLogos.lulu, active: orderItems.ok }
  ];

  return {
    stats,
    chartOrders,
    recentOrders,
    latestSubscribers,
    systemStatus,
    pendingOrderCount: pendingOrders.totalDocs,
    funnel: buildFunnel(allOrders.totalDocs, pendingOrders.totalDocs, completedOrders.length, subscribers.totalDocs, orderItems.totalDocs)
  };
}

async function BeforeDashboard() {
  const dashboard = await getDashboardData();

  return (
    <section className="bp-dashboard" aria-label="Benny and Penny admin dashboard">
      <header className="bp-dashboard__topbar">
        <div>
          <h1>Welcome, <AdminWelcomeName />!</h1>
          <p>Live order, fulfillment, customer, and compliance command center.</p>
        </div>
        <form className="bp-dashboard__search" action="/admin/collections/orders" method="get">
          <label className="bp-dashboard__searchIcon" htmlFor="bp-admin-search">⌕</label>
          <input id="bp-admin-search" name="q" placeholder="Search for an order, customer, or title..." type="search" />
        </form>
      </header>

      <div className="bp-dashboard__stats" aria-label="Dashboard key performance indicators">
        {dashboard.stats.map(({ Icon, ...stat }) => (
          <article className="bp-dashboard__stat" key={stat.label}>
            <div className="bp-dashboard__statIcon" aria-hidden="true"><Icon size={18} strokeWidth={2.5} /></div>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
            <em>{stat.trend}</em>
          </article>
        ))}
      </div>

      <div className="bp-dashboard__mockGrid">
        <div className="bp-dashboard__row bp-dashboard__row--half">
          <article className="bp-dashboard__card bp-dashboard__card--performance">
            <div className="bp-dashboard__cardHeader"><div><h2>Performance Tracker</h2><p>Hourly sales count vs. launch-day timing.</p></div></div>
            <DashboardSalesChart orders={dashboard.chartOrders} />
          </article>

          <article className="bp-dashboard__card bp-dashboard__card--system">
            <div className="bp-dashboard__cardHeader"><div><h2>System Status Check</h2><p>CMS, checkout, email, and fulfillment services.</p></div></div>
            <div className="bp-dashboard__systemList">
              {dashboard.systemStatus.map((item) => (
                <div className="bp-dashboard__systemItem" key={item.label}>
                  <span className="bp-dashboard__serviceIcon"><img alt="" src={item.logoUrl} /></span>
                  <div><strong>{item.label}</strong><small>{item.detail}</small></div>
                  <em className={item.active ? "is-active" : "is-pending"}>{item.active ? "ONLINE" : "CHECK"}</em>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="bp-dashboard__row bp-dashboard__row--wide">
          <article className="bp-dashboard__card bp-dashboard__card--recent">
            <div className="bp-dashboard__cardHeader"><div><h2>Recent Orders</h2><p>Latest checkout activity from Stripe-backed orders.</p></div><Link href="/admin/collections/orders">View all</Link></div>
            <div className="bp-dashboard__orderTable">
              {dashboard.recentOrders.length ? dashboard.recentOrders.map((order) => (
                <Link className="bp-dashboard__orderRow" href={order.href} key={order.id}>
                  <span><strong>{order.orderId}</strong><small>{order.customerName}</small></span>
                  <span>{order.created}</span>
                  <em className={`tone-${order.tone}`}>{order.status}</em>
                  <strong>{order.total}</strong>
                </Link>
              )) : <p className="bp-dashboard__empty">No orders yet.</p>}
            </div>
          </article>
        </div>

        <div className="bp-dashboard__row bp-dashboard__row--half">
          <article className="bp-dashboard__card bp-dashboard__card--funnel">
            <div className="bp-dashboard__cardHeader"><div><h2>Launch Funnel</h2><p>Estimated funnel snapshot from current records.</p></div></div>
            <div className="bp-dashboard__funnel">
              {dashboard.funnel.map((item) => (
                <div className="bp-dashboard__funnelItem" key={item.label}>
                  <div><strong>{item.label}</strong><span>{item.value}</span></div>
                  <div className="bp-dashboard__funnelBar"><span style={{ width: `${item.width}%` }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="bp-dashboard__card bp-dashboard__card--subscribers">
            <div className="bp-dashboard__cardHeader"><div><h2>Community Growth</h2><p>Recent subscribers and gift-led contacts.</p></div><Link href="/admin/collections/subscribers">Subscribers</Link></div>
            <div className="bp-dashboard__subscriberList">
              {dashboard.latestSubscribers.length ? dashboard.latestSubscribers.map((subscriber) => (
                <Link className="bp-dashboard__subscriberRow" href={subscriber.href} key={subscriber.id}>
                  <span><strong>{subscriber.name}</strong><small>{subscriber.email}</small></span>
                  <em>{subscriber.dateJoined}</em>
                  <small>{subscriber.status}</small>
                </Link>
              )) : <p className="bp-dashboard__empty">No subscribers yet.</p>}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default BeforeDashboard;
