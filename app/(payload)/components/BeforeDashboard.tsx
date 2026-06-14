import config from "@payload-config";
import Link from "next/link";
import { getPayload } from "payload";
import React from "react";
import AdminWelcomeName from "./AdminWelcomeName";
import "./BeforeDashboard.scss";
import "./RegionCompact.scss";

type PayloadDoc = {
  id?: string | number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

type PayloadListResult = {
  docs: PayloadDoc[];
  totalDocs: number;
};

type StatCard = {
  label: string;
  value: string;
  note: string;
  icon: string;
  trend: string;
};

type RecentOrder = {
  id: string;
  href: string;
  customer: string;
  status: string;
  total: string;
  createdAt: string;
};

type RecentOrderItem = {
  id: string;
  href: string;
  order: string;
  title: string;
  format: string;
  quantity: string;
  unitPrice: string;
};

type RecentSubscriber = {
  id: string;
  href: string;
  email: string;
  name: string;
  createdAt: string;
  status: string;
};

type SalesBar = {
  label: string;
  value: number;
  total: string;
  orders: number;
};

const salesRanges = [
  "Today",
  "Last 3 days",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "Last 45 days",
  "Last 60 days",
  "Last 90 days",
  "Last 120 days",
  "Last Year"
];

const quickLinks = [
  { label: "Review Orders", href: "/admin/collections/orders" },
  { label: "Order Details", href: "/admin/collections/order-items" },
  { label: "Customer Addresses", href: "/admin/collections/customer-addresses" },
  { label: "View Subscribers", href: "/admin/collections/subscribers" },
  { label: "Support Tickets", href: "/admin/collections/support-tickets" }
];

const compactGridStyle: React.CSSProperties = {
  alignItems: "start"
};

const compactRegionCardStyle: React.CSSProperties = {
  alignSelf: "start",
  display: "flex",
  flexDirection: "column",
  height: "300px",
  justifyContent: "center",
  maxHeight: "300px",
  minHeight: "300px",
  overflow: "hidden",
  padding: "14px"
};

const compactRegionTitleStyle: React.CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1.05,
  margin: 0
};

const compactRegionTextStyle: React.CSSProperties = {
  fontSize: "0.78rem",
  lineHeight: 1.18,
  margin: "0.35rem 0 0"
};

const compactDonutStyle: React.CSSProperties = {
  height: "126px",
  margin: "0.58rem auto",
  width: "126px"
};

const compactLegendStyle: React.CSSProperties = {
  gap: "0.55rem",
  marginTop: "0.1rem"
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

function formatFormat(value: unknown) {
  const format = getString(value, "unknown");
  if (format === "digital") return "PDF / EPUB";
  if (format === "audiobook") return "Audiobook";
  if (format === "paperback") return "Paperback";
  if (format === "hardcover") return "Hardcover";
  return format;
}

function getRelationshipTitle(value: unknown, fallback = "—") {
  if (typeof value === "object" && value !== null) {
    const doc = value as PayloadDoc;
    return getString(doc.orderNumber, getString(doc.title, getString(doc.email, fallback)));
  }

  if (typeof value === "string" || typeof value === "number") return String(value);
  return fallback;
}

async function safeFind(collection: string, options: Record<string, unknown> = {}): Promise<PayloadListResult> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection,
      limit: 10,
      depth: 1,
      ...options
    } as never);

    return {
      docs: Array.isArray(result.docs) ? (result.docs as PayloadDoc[]) : [],
      totalDocs: typeof result.totalDocs === "number" ? result.totalDocs : 0
    };
  } catch (error) {
    console.error(`Dashboard data fetch failed for ${collection}`, error);
    return { docs: [], totalDocs: 0 };
  }
}

function buildSalesBars(orders: PayloadDoc[]): SalesBar[] {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      orders: 0,
      revenue: 0
    };
  });

  const byKey = new Map(months.map((month) => [month.key, month]));

  for (const order of orders) {
    if (!order.createdAt) continue;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.revenue += getNumber(order.total);
  }

  const maxRevenue = Math.max(...months.map((month) => month.revenue), 1);

  return months.map((month) => ({
    label: month.label,
    value: Math.max(8, Math.round((month.revenue / maxRevenue) * 100)),
    total: formatMoney(month.revenue),
    orders: month.orders
  }));
}

async function getDashboardData() {
  const [orders, allOrdersForChart, orderItems, subscribers, addresses, supportTickets, books, users] = await Promise.all([
    safeFind("orders", { limit: 5, sort: "-createdAt" }),
    safeFind("orders", { limit: 200, sort: "-createdAt" }),
    safeFind("order-items", { limit: 5, sort: "-createdAt" }),
    safeFind("subscribers", { limit: 5, sort: "-createdAt" }),
    safeFind("customer-addresses", { limit: 5, sort: "-createdAt" }),
    safeFind("support-tickets", { limit: 5, sort: "-createdAt" }),
    safeFind("books", { limit: 1 }),
    safeFind("users", { limit: 1 })
  ]);

  const paidOrders = allOrdersForChart.docs.filter((order) => getString(order.status).toLowerCase() === "paid");
  const totalRevenue = paidOrders.reduce((sum, order) => sum + getNumber(order.total), 0);
  const totalItems = orderItems.docs.reduce((sum, item) => sum + getNumber(item.quantity), 0);

  const stats: StatCard[] = [
    {
      label: "Total Revenue",
      value: formatMoney(totalRevenue),
      note: "Paid Stripe orders",
      icon: "♡",
      trend: `${paidOrders.length} paid`
    },
    {
      label: "Orders",
      value: String(orders.totalDocs),
      note: "Total order records",
      icon: "🧾",
      trend: "Live"
    },
    {
      label: "Items Sold",
      value: String(totalItems),
      note: "Order Details rows",
      icon: "📚",
      trend: `${orderItems.totalDocs} lines`
    },
    {
      label: "Subscribers",
      value: String(subscribers.totalDocs),
      note: "Community list",
      icon: "💌",
      trend: "Live"
    }
  ];

  const recentOrders: RecentOrder[] = orders.docs.map((order) => ({
    id: getString(order.orderNumber, String(order.id || "—")),
    href: `/admin/collections/orders/${order.id}`,
    customer: getString(order.customerEmail, "—"),
    status: getString(order.status, "—"),
    total: formatMoney(getNumber(order.total)),
    createdAt: formatDate(order.createdAt)
  }));

  const recentOrderItems: RecentOrderItem[] = orderItems.docs.map((item) => ({
    id: String(item.id || `${item.title}-${item.createdAt}`),
    href: `/admin/collections/order-items/${item.id}`,
    order: getRelationshipTitle(item.order),
    title: getString(item.title, "—"),
    format: formatFormat(item.format),
    quantity: String(getNumber(item.quantity) || 1),
    unitPrice: formatMoney(getNumber(item.unitPrice))
  }));

  const recentSubscribers: RecentSubscriber[] = subscribers.docs.map((subscriber) => ({
    id: String(subscriber.id || subscriber.email || subscriber.createdAt),
    href: `/admin/collections/subscribers/${subscriber.id}`,
    email: getString(subscriber.email, "—"),
    name: getString(subscriber.name, getString(subscriber.fullName, "Subscriber")),
    createdAt: formatShortDate(subscriber.createdAt),
    status: getString(subscriber.status, "Active")
  }));

  return {
    stats,
    salesBars: buildSalesBars(allOrdersForChart.docs),
    recentOrders,
    recentOrderItems,
    recentSubscribers,
    counts: {
      addresses: addresses.totalDocs,
      supportTickets: supportTickets.totalDocs,
      books: books.totalDocs,
      users: users.totalDocs
    }
  };
}

async function BeforeDashboard() {
  const dashboard = await getDashboardData();

  return (
    <section className="bp-dashboard" aria-label="Benny and Penny admin dashboard">
      <header className="bp-dashboard__topbar">
        <div>
          <p className="bp-dashboard__brandline">Benny &amp; Penny&apos;s Adventures | Admin Dashboard</p>
          <h1>Welcome, <AdminWelcomeName />! <span aria-hidden="true">🧸</span></h1>
          <p>Connected to live orders, customers, subscribers, and support data.</p>
        </div>
        <div className="bp-dashboard__topActions" aria-label="Admin utility placeholders">
          <span title="Help">?</span>
          <span title="Notifications">🔔</span>
          <span title="Admin profile">🐻</span>
        </div>
      </header>

      <div className="bp-dashboard__stats" aria-label="Dashboard key performance indicators">
        {dashboard.stats.map((stat) => (
          <article className="bp-dashboard__stat" key={stat.label}>
            <div className="bp-dashboard__statIcon" aria-hidden="true">{stat.icon}</div>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
            <em>{stat.trend}</em>
          </article>
        ))}
      </div>

      <div className="bp-dashboard__mainGrid" style={compactGridStyle}>
        <article className="bp-dashboard__card bp-dashboard__card--sales">
          <div className="bp-dashboard__cardHeader">
            <div>
              <h2>Sales Performance</h2>
              <p>Revenue and order counts from live Payload order records.</p>
            </div>
            <select aria-label="Sales period" defaultValue="Last 30 days">
              {salesRanges.map((range) => <option value={range} key={range}>{range}</option>)}
            </select>
          </div>

          <div className="bp-dashboard__chart" aria-label="Book sales performance with revenue totals">
            {dashboard.salesBars.map((bar) => (
              <div
                className="bp-dashboard__barWrap"
                data-tooltip={`${bar.label}: ${bar.total} · ${bar.orders} orders`}
                key={bar.label}
                tabIndex={0}
                title={`${bar.label}: ${bar.total} · ${bar.orders} orders`}
              >
                <span style={{ height: `${bar.value}%` }} />
                <small>{bar.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="bp-dashboard__card bp-dashboard__card--region" style={compactRegionCardStyle}>
          <h2 style={compactRegionTitleStyle}>Database Health</h2>
          <p style={compactRegionTextStyle}>Live records connected for portal-ready data.</p>
          <div className="bp-dashboard__donut" aria-hidden="true" style={compactDonutStyle}>
            <span>Live</span>
          </div>
          <div className="bp-dashboard__legend" style={compactLegendStyle}>
            <span><i /> {dashboard.counts.books} Books</span>
            <span><i /> {dashboard.counts.addresses} Addresses</span>
            <span><i /> {dashboard.counts.users} Users</span>
          </div>
        </article>
      </div>

      <div className="bp-dashboard__bottomGrid">
        <article className="bp-dashboard__card">
          <div className="bp-dashboard__cardHeader bp-dashboard__cardHeader--compact">
            <h2>Recent Orders</h2>
            <Link href="/admin/collections/orders">View all</Link>
          </div>
          <div className="bp-dashboard__tableShell">
            <table>
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.length ? dashboard.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><Link href={order.href}>{order.id}</Link></td>
                    <td>{order.customer}</td>
                    <td>{order.total}</td>
                    <td><span className="bp-dashboard__pill bp-dashboard__pill--order">{order.status}</span></td>
                    <td>{order.createdAt}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}>No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bp-dashboard__card">
          <div className="bp-dashboard__cardHeader bp-dashboard__cardHeader--compact">
            <h2>Recent Order Details</h2>
            <Link href="/admin/collections/order-items">View all</Link>
          </div>
          <div className="bp-dashboard__tableShell">
            <table>
              <thead>
                <tr><th>Order</th><th>Book / Item</th><th>Format</th><th>Qty</th><th>Unit</th></tr>
              </thead>
              <tbody>
                {dashboard.recentOrderItems.length ? dashboard.recentOrderItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.order}</td>
                    <td><Link href={item.href}>{item.title}</Link></td>
                    <td>{item.format}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unitPrice}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={5}>No order details yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="bp-dashboard__utilityGrid">
        <article className="bp-dashboard__card">
          <div className="bp-dashboard__cardHeader bp-dashboard__cardHeader--compact">
            <h2>Latest Subscribers</h2>
            <Link href="/admin/collections/subscribers">View all</Link>
          </div>
          <div className="bp-dashboard__tableShell">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Date Joined</th><th>Status</th></tr>
              </thead>
              <tbody>
                {dashboard.recentSubscribers.length ? dashboard.recentSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td><Link href={subscriber.href}>♥ {subscriber.name}</Link></td>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.createdAt}</td>
                    <td><span className="bp-dashboard__pill">{subscriber.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4}>No subscribers yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bp-dashboard__card">
          <h2>Quick Links</h2>
          <nav className="bp-dashboard__quickLinks" aria-label="Admin quick links">
            {quickLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
          <div className="bp-dashboard__statusList">
            <div><span>Support Tickets</span><strong>{dashboard.counts.supportTickets}</strong></div>
            <div><span>Customer Addresses</span><strong>{dashboard.counts.addresses}</strong></div>
            <div><span>Customer Users</span><strong>{dashboard.counts.users}</strong></div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { BeforeDashboard };
export default BeforeDashboard;
