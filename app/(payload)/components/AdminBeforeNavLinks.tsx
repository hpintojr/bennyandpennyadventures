import { ShoppingCart } from "lucide-react";
import React from "react";
import { AdminSidebarNavLink } from "./AdminSidebarNavLink";
import { OrderProfileActions } from "./OrderProfileActions";
import AdminSidebarIdentity from "./AdminSidebarIdentity";
import "./AdminSidebarCompliance.scss";

const customersFilterHref = "/admin/collections/users?where%5Brole%5D%5Bequals%5D=customer";

export async function AdminBeforeNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      <OrderProfileActions />
      <div className="bp-admin-sidebar-brand" aria-label="Benny and Penny admin panel">
        <div className="bp-admin-sidebar-brand__heart" aria-hidden="true">♥</div>
        <div className="bp-admin-sidebar-brand__title">Benny &amp; Penny&apos;s</div>
        <div className="bp-admin-sidebar-brand__subtitle">Admin Panel</div>
      </div>

      <AdminSidebarIdentity />

      <div className="bp-admin-nav-extra__hubLabel">Adventure Hub</div>

      <AdminSidebarNavLink activeKey="dashboard" href="/admin" iconName="dashboard" label="Dashboard" />

      <div className="bp-admin-nav-extra__section">
        <div className="bp-admin-nav-extra__heading">Sales</div>
        <AdminSidebarNavLink activeKey="orders" href="/admin/collections/orders" iconName="package" label="Orders" />
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
        <AdminSidebarNavLink activeKey="printJobs" href="/admin/collections/print-jobs" iconName="package" label="Print Jobs" />
        <AdminSidebarNavLink activeKey="luluSubmit" href="/admin/lulu-submit" iconName="activity" label="Submit to LuLu" />
      </div>

      <div className="bp-admin-nav-extra__section">
        <div className="bp-admin-nav-extra__heading">Marketing</div>
        <AdminSidebarNavLink activeKey="promotions" href="/admin/collections/promotions" iconName="ticket" label="Promotions" />
        <AdminSidebarNavLink activeKey="gifts" href="/admin/collections/gifts" iconName="gift" label="Gifts" />
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
