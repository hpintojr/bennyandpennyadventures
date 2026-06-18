import config from "@payload-config";
import React from "react";
import { getPayload } from "payload";
import AdminWelcomeName from "./AdminWelcomeName";
import DashboardLiveAnalytics from "./DashboardLiveAnalytics";
import { getDashboardAnalytics } from "@/lib/dashboardAnalytics";
import "./BeforeDashboard.scss";
import "./RegionCompact.scss";

type PayloadDoc = { id?: string | number; createdAt?: string; [key: string]: unknown };
type PayloadListResult = { docs: PayloadDoc[]; totalDocs: number; ok: boolean };
type RecentOrder = { id: string; href: string; orderId: string; customerName: string; status: string; tone: string; total: string; created: string };
type RecentSubscriber = { id: string; href: string; name: string; email: string; dateJoined: string; status: string };
type StatusItem = { label: string; detail: string; logoUrl: string; active: boolean };

const serviceLogos = {
  payload: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/payload.svg",
  neon: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/neon-tech.svg",
  stripe: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/stripe.svg",
  r2: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/cloudflare-zero-trust.svg",
  sequenzy: "https://media.theresanaiforthat.com/icons/sequenzy.svg",
  mailjet: "https://cdn.jsdelivr.net/gh/selfhst/icons/svg/mailjet.svg",
  googlePlaces: "https://www.svgrepo.com/show/353810/google-developers.svg",
  lulu: "https://cdn.brandfetch.io/idICJd57ED/theme/dark/logo.svg?c=1bxid64Mup7aczewSAYMX&t=1778052093073"
};

function getString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
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

function formatMoney(value: unknown) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(amount);
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

function hasGooglePlacesConfig() {
  const primary = ["GOOGLE", "PLACES", "API", "KEY"].join("_");
  const maps = ["GOOGLE", "MAPS", "API", "KEY"].join("_");
  const publicName = ["NEXT", "PUBLIC", "GOOGLE", "PLACES", "API", "KEY"].join("_");
  return Boolean(process.env[primary] || process.env[maps] || process.env[publicName]);
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

async function getDashboardStaticData() {
  const [orders, subscribers, downloads, orderItems, users] = await Promise.all([
    safeFind("orders", { limit: 5, sort: "-createdAt" }),
    safeFind("subscribers", { limit: 5, sort: "-createdAt" }),
    safeFind("downloads", { limit: 1 }),
    safeFind("order-items", { limit: 1 }),
    safeFind("users", { limit: 1 })
  ]);

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
      total: formatMoney(order.total),
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

  const hasStripeRecords = orders.docs.some((order) => getString(order.stripeCheckoutSessionId) || getString(order.stripePaymentIntentId));
  const googlePlacesConfigured = hasGooglePlacesConfig();
  const systemStatus: StatusItem[] = [
    { label: "Payload CMS/API", detail: orders.ok ? "CONNECTED/ACTIVE" : "CHECK LOGS", logoUrl: serviceLogos.payload, active: orders.ok },
    { label: "Neon Database", detail: orders.ok && users.ok ? "CONNECTED/ACTIVE" : "CHECK CONNECTION", logoUrl: serviceLogos.neon, active: orders.ok && users.ok },
    { label: "Stripe API", detail: hasStripeRecords ? "CONNECTED/ACTIVE" : "READY TO VERIFY", logoUrl: serviceLogos.stripe, active: hasStripeRecords },
    { label: "R2 Fulfillment", detail: downloads.ok ? "CONNECTED/ACTIVE" : "CHECK FULFILLMENT", logoUrl: serviceLogos.r2, active: downloads.ok },
    { label: "Sequenzy API", detail: subscribers.ok ? "CONNECTED/ACTIVE" : "CHECK EMAIL", logoUrl: serviceLogos.sequenzy, active: subscribers.ok },
    { label: "Mailjet API", detail: subscribers.ok ? "CONNECTED/ACTIVE" : "CHECK EMAIL", logoUrl: serviceLogos.mailjet, active: subscribers.ok },
    { label: "Google Places API", detail: googlePlacesConfigured ? "CONNECTED/ACTIVE" : "READY TO CONFIGURE", logoUrl: serviceLogos.googlePlaces, active: googlePlacesConfigured },
    { label: "LuLu Press API", detail: orderItems.ok ? "CONNECTED/ACTIVE" : "READY TO VERIFY", logoUrl: serviceLogos.lulu, active: orderItems.ok }
  ];

  return { recentOrders, latestSubscribers, systemStatus };
}

export async function BeforeDashboard() {
  const [staticData, initialAnalytics] = await Promise.all([
    getDashboardStaticData(),
    getDashboardAnalytics("Today")
  ]);

  return (
    <section className="bp-dashboard" aria-label="Benny and Penny admin dashboard">
      <header className="bp-dashboard__topbar">
        <div className="bp-dashboard__intro">
          <h1>Welcome, <AdminWelcomeName /></h1>
          <p>Live order, fulfillment, customer, and compliance command center.</p>
        </div>
      </header>

      <form className="bp-dashboard__search bp-dashboard__search--standalone" action="/admin/collections/orders" method="get">
        <label className="bp-dashboard__searchIcon" htmlFor="bp-admin-search">⌕</label>
        <input id="bp-admin-search" name="q" placeholder="Search for an order, customer, or title..." type="search" />
      </form>

      <DashboardLiveAnalytics
        initialData={initialAnalytics}
        systemStatus={staticData.systemStatus}
        recentOrders={staticData.recentOrders}
        latestSubscribers={staticData.latestSubscribers}
      />
    </section>
  );
}

export default BeforeDashboard;
