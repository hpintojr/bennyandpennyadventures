import React from "react";
import "./BeforeDashboard.scss";

const stats = [
  { label: "Total Book Sales", value: "$14,580", note: "Demo revenue view", icon: "♥" },
  { label: "Books Sold", value: "750+", note: "Last 30 days", icon: "📚" },
  { label: "Active Book Titles", value: "9", note: "Seeded in Payload", icon: "🧸" },
  { label: "Subscriber Growth", value: "5,432", note: "Email community", icon: "💌" }
];

const quickLinks = [
  { label: "Add New Book", href: "/admin/collections/books/create" },
  { label: "Review Orders", href: "/admin/collections/orders" },
  { label: "View Subscribers", href: "/admin/collections/subscribers" },
  { label: "Contact Submissions", href: "/admin/collections/contact-submissions" }
];

const latestOrders = [
  { id: "#10024", book: "Home Infusion Day", quantity: 2, customer: "Emily R.", date: "Today" },
  { id: "#10023", book: "Port Adventure", quantity: 1, customer: "Liam S.", date: "Today" }
];

const subscribers = [
  { name: "Penelope P.", email: "penelope@email.com", status: "Active" },
  { name: "Benjamin B.", email: "benjamin@email.com", status: "Active" }
];

function BeforeDashboard() {
  return (
    <section className="bp-dashboard">
      <div className="bp-dashboard__hero">
        <div>
          <p className="bp-dashboard__eyebrow">Benny & Penny&apos;s Adventures</p>
          <h1>Welcome, Nurse Ivy! 🧸</h1>
          <p>Benny and Penny are ready to manage book sales, subscribers, downloads, and your growing community.</p>
        </div>
        <a className="bp-dashboard__heroButton" href="/admin/collections/books/create">Add New Book</a>
      </div>

      <div className="bp-dashboard__stats">
        {stats.map((stat) => (
          <article className="bp-dashboard__stat" key={stat.label}>
            <span>{stat.icon}</span>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.note}</small>
          </article>
        ))}
      </div>

      <div className="bp-dashboard__grid">
        <article className="bp-dashboard__card bp-dashboard__card--wide">
          <div className="bp-dashboard__cardHeader">
            <h2>Book Sales Performance</h2>
            <select aria-label="Sales period" defaultValue="all">
              <option value="all">All Months</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <div className="bp-dashboard__chart" aria-label="Sales chart preview">
            <span style={{ height: "40%" }} />
            <span style={{ height: "52%" }} />
            <span style={{ height: "64%" }} />
            <span style={{ height: "57%" }} />
            <span style={{ height: "82%" }} />
            <span style={{ height: "68%" }} />
            <span style={{ height: "72%" }} />
            <span style={{ height: "48%" }} />
            <span style={{ height: "78%" }} />
            <span style={{ height: "88%" }} />
            <span style={{ height: "44%" }} />
          </div>
        </article>

        <aside className="bp-dashboard__card">
          <h2>Quick Links</h2>
          <nav className="bp-dashboard__quickLinks" aria-label="Admin quick links">
            {quickLinks.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
          </nav>
          <div className="bp-dashboard__system">
            <strong>System Status</strong>
            <span>All key admin panels online ♥</span>
          </div>
        </aside>
      </div>

      <div className="bp-dashboard__grid bp-dashboard__grid--bottom">
        <article className="bp-dashboard__card">
          <h2>Latest Community Newsletter Subscribers</h2>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.email}><td>{subscriber.name}</td><td>{subscriber.email}</td><td><span className="bp-dashboard__pill">{subscriber.status}</span></td></tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="bp-dashboard__card">
          <h2>Recent Book Sales Orders</h2>
          <table>
            <thead><tr><th>Order</th><th>Book</th><th>Qty</th><th>Customer</th><th>Date</th></tr></thead>
            <tbody>
              {latestOrders.map((order) => (
                <tr key={order.id}><td>{order.id}</td><td>{order.book}</td><td>{order.quantity}</td><td>{order.customer}</td><td>{order.date}</td></tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}

export { BeforeDashboard };
export default BeforeDashboard;
