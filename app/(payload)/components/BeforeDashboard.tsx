import Link from "next/link";
import React from "react";
import AdminWelcomeName from "./AdminWelcomeName";
import "./BeforeDashboard.scss";

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

const monthlySales = [
  { month: "Jan", value: 54 },
  { month: "Feb", value: 61 },
  { month: "Mar", value: 74 },
  { month: "Apr", value: 66 },
  { month: "May", value: 92 },
  { month: "Jun", value: 71 },
  { month: "Jul", value: 78 },
  { month: "Aug", value: 50 },
  { month: "Sep", value: 88 },
  { month: "Oct", value: 76 },
  { month: "Nov", value: 96 },
  { month: "Dec", value: 58 }
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
  { label: "Stripe Sandbox", status: "Pending setup" },
  { label: "R2 Fulfillment", status: "Planned" }
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
              <p>Mock sales data while Stripe sandbox is being prepared.</p>
            </div>
            <select aria-label="Sales period" defaultValue="all">
              <option value="all">All Months</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          <div className="bp-dashboard__chart" aria-label="Monthly book sales performance preview">
            {monthlySales.map((month) => (
              <div className="bp-dashboard__barWrap" key={month.month}>
                <span style={{ height: `${month.value}%` }} />
                <small>{month.month}</small>
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
        </article>
      </div>
    </section>
  );
}

export { BeforeDashboard };
export default BeforeDashboard;
