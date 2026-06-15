import config from "@payload-config";
import { ShoppingCart, Ticket } from "lucide-react";
import { getPayload } from "payload";
import React from "react";
import { AdminSidebarNavLink } from "./AdminSidebarNavLink";
import "./AdminSidebarCompliance.scss";

const customersFilterHref = "/admin/collections/users?where%5Brole%5D%5Bequals%5D=customer";

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

  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      <div className="bp-admin-sidebar-brand" aria-label="Benny and Penny admin panel">
        <div className="bp-admin-sidebar-brand__heart" aria-hidden="true">♥</div>
        <div className="bp-admin-sidebar-brand__title">Benny &amp; Penny&apos;s</div>
        <div className="bp-admin-sidebar-brand__subtitle">Admin Panel</div>
      </div>

      <div className="bp-admin-nav-extra__hubLabel">Adventure Hub</div>

      <AdminSidebarNavLink activeKey="dashboard" href="/admin" iconName="dashboard" label="Dashboard" />

      <div className="bp-admin-nav-extra__section">
        <div className="bp-admin-nav-extra__heading">Sales</div>
        <AdminSidebarNavLink activeKey="orders" badge={pendingOrders} href="/admin/collections/orders" iconName="package" label="Orders" />
        <AdminSidebarNavLink activeKey="customers" href={customersFilterHref} iconName="users" label="Customers" />
        <span className="bp-admin-nav-extra__link bp-admin-nav-extra__link--disabled" title="Coming soon">
          <ShoppingCart className="bp-admin-nav-extra__iconSvg" size={18} strokeWidth={2.5} aria-hidden="true" />
          <em>Abandoned Carts</em>
          <small>Coming soon</small>
        </span>
      </div>

      <div className="bp-admin-nav-extra__section">
        <div className="bp-admin-nav-extra__heading">Catalog</div>
        <AdminSidebarNavLink activeKey="books" href="/admin/collections/books" iconName="book" label="Books" />
        <AdminSidebarNavLink activeKey="media" href="/admin/collections/downloads" iconName="image" label="Media" />
      </div>

      <div className="bp-admin-nav-extra__section">
        <div className="bp-admin-nav-extra__heading">Marketing</div>
        <span className="bp-admin-nav-extra__link bp-admin-nav-extra__link--disabled" title="Stripe Coupons">
          <Ticket className="bp-admin-nav-extra__iconSvg" size={18} strokeWidth={2.5} aria-hidden="true" />
          <em>Promotions</em>
          <small>Stripe Coupons</small>
        </span>
        <AdminSidebarNavLink activeKey="subscribers" href="/admin/collections/subscribers" iconName="mail" label="Subscribers" />
      </div>

      <div className="bp-admin-nav-extra__section">
        <div className="bp-admin-nav-extra__heading">Settings</div>
        <AdminSidebarNavLink activeKey="users" href="/admin/collections/users" iconName="userCog" label="Users" />
        <AdminSidebarNavLink activeKey="system" href="/admin#system-status" iconName="activity" label="System Status Check" />
        <AdminSidebarNavLink activeKey="privacy" href="/admin/collections/privacy-requests" iconName="shield" label="Privacy Requests" />
      </div>
    </div>
  );
}

export default AdminBeforeNavLinks;
