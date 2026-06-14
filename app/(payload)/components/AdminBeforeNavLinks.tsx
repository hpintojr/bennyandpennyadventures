import Link from "next/link";
import React from "react";
import "./AdminSidebarCompliance.scss";

const adminLinks = [
  { label: "Orders", href: "/admin/collections/orders", icon: "♡" },
  { label: "Order Details", href: "/admin/collections/order-items", icon: "☰" },
  { label: "Customer Addresses", href: "/admin/collections/customer-addresses", icon: "⌁" },
  { label: "Subscribers", href: "/admin/collections/subscribers", icon: "✉" },
  { label: "Support", href: "/admin/collections/support-tickets", icon: "?" },
  { label: "Privacy Requests", href: "/admin/collections/privacy-requests", icon: "✓" },
  { label: "Consent Logs", href: "/admin/collections/consent-logs", icon: "◎" },
  { label: "Settings", href: "/admin/collections/users", icon: "⚙" }
];

export function AdminBeforeNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      <Link className="bp-admin-nav-extra__link" href="/admin">
        <span aria-hidden="true">⌂</span>
        Dashboard
      </Link>
      <div className="bp-admin-nav-extra__heading">Adventure Hub</div>
      {adminLinks.map((link) => (
        <Link className="bp-admin-nav-extra__link" href={link.href} key={link.href}>
          <span aria-hidden="true">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export default AdminBeforeNavLinks;
