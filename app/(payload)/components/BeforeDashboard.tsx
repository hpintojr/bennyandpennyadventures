import Link from "next/link";
import React from "react";
import AdminWelcomeName from "./AdminWelcomeName";
import "./BeforeDashboard.scss";
import "./RegionCompact.scss";

const stats = [
  {
    label: "Total Book Sales (USD)",
    value: "$14,580.00",
    note: "Sandbox dashboard preview",
    icon: "♡",
    trend: "+12%"
  },
  {
    label: "Books Sold",
    value: "750+",
    note: "Last 30 days",
    icon: "📚",
    trend: "+8%"
  },
  {
    label: "Active Book Titles",
    value: "9 titles",
    note: "Seeded in Payload",
    icon: "🧸",
    trend: "Ready"
  },
  {
    label: "Subscriber Growth",
    value: "5,432 ↑",
    note: "Community list preview",
    icon: "💌",
    trend: "+18%"
  }
];

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

const salesBars = [
  { label: "Jan", value: 54, total: "$540", orders: 34 },
  { label: "Feb", value: 61, total: "$620", orders: 39 },
  { label: "Mar", value: 74, total: "$750", orders: 47 },
  { label: "Apr", value: 66, total: "$650", orders: 41 },
  { label: "May", value: 92, total: "$1,000", orders: 63 },
  { label: "Jun", value: 71, total: "$720", orders: 45 },
  { label: "Jul", value: 78, total: "$800", orders: 50 },
  { label: "Aug", value: 50, total: "$510", orders: 32 },
  { label: "Sep", value: 88, total: "$950", orders: 59 },
  { label: "Oct", value: 76, total: "$780", orders: 49 },
  { label: "Nov", value: 96, total: "$1,040", orders: 65 },
  { label: "Dec", value: 58, total: "$490", orders: 31 }
];

const quickLinks = [
  { label: "Add New Book", href: "/admin/collections/books/create" },
  { label: "Review Orders", href: "/admin/collections/orders" },
  { label: "View Subscribers", href: "/admin/collections/subscribers" },
  { label: "Contact Submissions", href: "/admin/collections/contact-submissions" }
];

const latestOrders = [
  { id: "#10024", book: "Home Infusion Day", quantity: 2, customer: "Emily R.", date: "Today", status: "Paid" },
  { id: "#10023", book: "Port Adventure", quantity: 1, customer: "Liam S.", date: "Today", status: "Pending" },
  { id: "#10022", book: "PICC Line Adventure", quantity: 1, customer: "Ava M.", date: "Yesterday", status: "Fulfilled" }
];

const subscribers = [
  { name: "Penelope P.", email: "penelope@email.com", date: "2026-06-13", status: "Active" },
  { name: "Benjamin B.", email: "benjamin@email.com", date: "2026-06-13", status: "Active" },
  { name: "Mary C.", email: "mary@email.com", date: "2026-06-12", status: "New" }
];

const systemStatus = [
  { label: "Payload Admin", status: "Online" },
  { label: "Neon Database", status: "Connected" },
  { label: "Stripe Sandbox", status: "Ready for testing" },
  { label: "R2 Fulfillment", status: "Planned" },
  { label: "Mailjet API", status: "Pending live sync" }
];

const mailjetMetrics = [
  { label: "Sent", value: "0" },
  { label: "Opened", value: "0" },
  { label: "Bounced", value: "0" },
  { label: "Spam", value: "0" }
];

function BeforeDashboard() {
  return (
    <section className="bp-dashboard" aria-label="Benny and Penny admin dashboard">
      <header className="bp-dashboard__topbar">
        <div>
          <p className="bp-dashboard__brandline">Benny &amp; Penny&apos;s Adventures | Admin Dashboard</p>
          <h1>Welcome, <AdminWelcomeName />! <span aria-hidden="true">🧸</span></h1>
          <p>Benny and Penny are ready to manage your book sales and community.</p>
        </div>
        <div className="bp-dashboard__topActions" aria-label="Admin utility placeholders">
          <span title="Help">?</span>
          <span title="Notifications">🔔</span>
          <span title="Admin profile">🐻</span>
        </div>
      </header>

      <div className="bp-dashboard__stats" aria-label="Dashboard key performance indicators">
        {stats.map((stat) => (
          <article className="bp-dashboard__stat" key={stat.label}>
            <div className="bp-dashboard__statIcon" aria-hidden="true">{stat.icon}</div>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
            <em>{stat.trend}</em>
          </article>
        ))}
      </div>

      <div className="bp-dashboard__mainGrid">
        <article className="bp-dashboard__card bp-dashboard__card--sales">
          <div className="bp-dashboard__cardHeader">
            <div>
              <h2>Book Sales Performance</h2>
              <p>Hover each bar to preview revenue and order totals. Live Stripe data will replace this mock view.</p>
            </div>
            <select aria-label="Sales period" defaultValue="Last 30 days">
              {salesRanges.map((range) => <option value={range} key={range}>{range}</option>)}
            </select>
          </div>

          <div className="bp-dashboard__chart" aria-label="Book sales performance preview with hover totals">
            {salesBars.map((bar) => (
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

        <aside className="bp-dashboard__card bp-dashboard__card--region">
          <h2>Sales by Region</h2>
          <p>Preview only until Stripe order data is live.</p>
          <div className="bp-dashboard__donut" aria-hidden="true">
            <span>US</span>
          </div>
          <div className="bp-dashboard__legend">
            <span><i /> US</span>
            <span><i /> CA</span>
            <span><i /> UK</span>
          </div>
        </aside>
      </div>

      <div className="bp-dashboard__bottomGrid">
        <article className="bp-dashboard__card">
          <div className="bp-dashboard__cardHeader bp-dashboard__cardHeader--compact">
            <h2>Latest Community Newsletter Subscribers</h2>
            <Link href="/admin/collections/subscribers">View all</Link>
          </div>
          <div className="bp-dashboard__tableShell">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Date Joined</th><th>Status</th></tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber.email}>
                    <td>♥ {subscriber.name}</td>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.date}</td>
                    <td><span className="bp-dashboard__pill">{subscriber.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="bp-dashboard__card">
          <div className="bp-dashboard__cardHeader bp-dashboard__cardHeader--compact">
            <h2>Recent Book Sales Orders</h2>
            <Link href="/admin/collections/orders">View all</Link>
          </div>
          <div className="bp-dashboard__tableShell">
            <table>
              <thead>
                <tr><th>Order ID</th><th>Book Title</th><th>Qty</th><th>Customer</th><th>Status</th></tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.book}</td>
                    <td>{order.quantity}</td>
                    <td>{order.customer}</td>
                    <td><span className="bp-dashboard__pill bp-dashboard__pill--order">{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div className="bp-dashboard__utilityGrid">
        <article className="bp-dashboard__card">
          <h2>Quick Links</h2>
          <nav className="bp-dashboard__quickLinks" aria-label="Admin quick links">
            {quickLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
        </article>

        <article className="bp-dashboard__card">
          <h2>System Status</h2>
          <div className="bp-dashboard__statusList">
            {systemStatus.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.status}</strong>
              </div>
            ))}
          </div>
          <div className="bp-dashboard__mailjet">
            <h3>Mailjet API Email Metrics</h3>
            <div className="bp-dashboard__mailjetGrid">
              {mailjetMetrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export { BeforeDashboard };
export default BeforeDashboard;
