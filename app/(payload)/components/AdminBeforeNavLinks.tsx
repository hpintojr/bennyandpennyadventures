import Link from "next/link";
import React from "react";

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: "⌂" },
  { label: "Orders", href: "/admin/collections/orders", icon: "♡" },
  { label: "Order Details", href: "/admin/collections/order-items", icon: "☰" },
  { label: "Customer Addresses", href: "/admin/collections/customer-addresses", icon: "⌁" }
];

export function AdminBeforeNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      {adminLinks.map((link) => (
        <Link className="bp-admin-nav-extra__link" href={link.href} key={link.href}>
          <span aria-hidden="true">{link.icon}</span>
          {link.label}
        </Link>
      ))}
      <div className="bp-admin-nav-extra__heading">Adventure Hub</div>
    </div>
  );
}

export default AdminBeforeNavLinks;
