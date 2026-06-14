import config from "@payload-config";
import Link from "next/link";
import { getPayload } from "payload";
import React from "react";
import "./AdminSidebarCompliance.scss";

type SidebarLink = {
  label: string;
  href?: string;
  icon: string;
  badge?: number;
  note?: string;
};

const sidebarSections: { heading: string; links: SidebarLink[] }[] = [
  {
    heading: "Sales",
    links: [
      { label: "Orders", href: "/admin/collections/orders", icon: "▣" },
      { label: "Customers", href: "/admin/collections/users", icon: "◎" },
      { label: "Abandoned Carts", icon: "⌁", note: "Coming soon" }
    ]
  },
  {
    heading: "Catalog",
    links: [
      { label: "Books", href: "/admin/collections/books", icon: "▤" },
      { label: "Media", href: "/admin/collections/downloads", icon: "▧" }
    ]
  },
  {
    heading: "Marketing",
    links: [
      { label: "Promotions", icon: "◇", note: "Stripe Coupons" },
      { label: "Subscribers", href: "/admin/collections/subscribers", icon: "✉" }
    ]
  },
  {
    heading: "Settings",
    links: [
      { label: "Users", href: "/admin/collections/users", icon: "◎" },
      { label: "System Status Check", href: "/admin#system-status", icon: "◇" },
      { label: "Privacy Requests", href: "/admin/collections/privacy-requests", icon: "▨" }
    ]
  }
];

async function getPendingOrderCount() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "orders",
      depth: 0,
      limit: 1,
      where: {
        status: {
          equals: "pending"
        }
      }
    } as never);

    return typeof result.totalDocs === "number" ? result.totalDocs : 0;
  } catch (error) {
    console.error("Unable to load pending order count for admin sidebar", error);
    return 0;
  }
}

export async function AdminBeforeNavLinks() {
  const pendingOrders = await getPendingOrderCount();
  const sections = sidebarSections.map((section) => ({
    ...section,
    links: section.links.map((link) => link.label === "Orders" ? { ...link, badge: pendingOrders } : link)
  }));

  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      <div className="bp-admin-nav-extra__hubLabel">Adventure Hub</div>

      <Link className="bp-admin-nav-extra__link bp-admin-nav-extra__link--active" href="/admin">
        <span aria-hidden="true">⌂</span>
        Dashboard
      </Link>

      {sections.map((section) => (
        <div className="bp-admin-nav-extra__section" key={section.heading}>
          <div className="bp-admin-nav-extra__heading">{section.heading}</div>
          {section.links.map((link) => link.href ? (
            <Link className="bp-admin-nav-extra__link" href={link.href} key={`${section.heading}-${link.label}`}>
              <span aria-hidden="true">{link.icon}</span>
              <em>{link.label}</em>
              {typeof link.badge === "number" && link.badge > 0 ? <strong>{link.badge}</strong> : null}
            </Link>
          ) : (
            <span className="bp-admin-nav-extra__link bp-admin-nav-extra__link--disabled" title={link.note} key={`${section.heading}-${link.label}`}>
              <span aria-hidden="true">{link.icon}</span>
              <em>{link.label}</em>
              {link.note ? <small>{link.note}</small> : null}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AdminBeforeNavLinks;
