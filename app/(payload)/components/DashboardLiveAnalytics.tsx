"use client";

import { BookCopy, Mail, Package, Wallet, type LucideIcon } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import DashboardSalesChart from "./DashboardSalesChart";
import type { DashboardAnalyticsData, DashboardRecentOrder, DashboardRecentSubscriber, DashboardStatData } from "@/lib/dashboardAnalytics";
import type { DashboardRange } from "@/lib/dashboardRanges";

const icons: Record<DashboardStatData["icon"], LucideIcon> = {
  revenue: Wallet,
  orders: Package,
  items: BookCopy,
  subscribers: Mail
};

type SystemStatusItem = {
  label: string;
  detail: string;
  logoUrl: string;
  active: boolean;
};

type Props = {
  initialData: DashboardAnalyticsData;
  systemStatus: SystemStatusItem[];
  recentOrders: DashboardRecentOrder[];
  latestSubscribers: DashboardRecentSubscriber[];
};

export function DashboardLiveAnalytics({ initialData, systemStatus, recentOrders, latestSubscribers }: Props) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const changeRange = useCallback(async (range: DashboardRange) => {
    if (range === data.range || isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/dashboard?range=${encodeURIComponent(range)}`, { credentials: "include", cache: "no-store" });
      const result = (await response.json()) as { data?: DashboardAnalyticsData; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error || "Could not refresh dashboard data.");
      setData(result.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not refresh dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [data.range, isLoading]);

  return (
    <div className={`bp-dashboard__rangeContent${isLoading ? " is-loading" : ""}`}>
      <div className="bp-dashboard__stats" aria-label="Dashboard key performance indicators" aria-live="polite">
        {data.stats.map((stat) => {
          const Icon = icons[stat.icon];
          return (
            <article className="bp-dashboard__stat" key={stat.label}>
              <div className="bp-dashboard__statIcon" aria-hidden="true"><Icon size={18} strokeWidth={2.5} /></div>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <small>{stat.note}</small>
              <em>{stat.trend}</em>
            </article>
          );
        })}
      </div>

      <div className="bp-dashboard__mockGrid">
        <div className="bp-dashboard__row bp-dashboard__row--half">
          <article className="bp-dashboard__card bp-dashboard__card--performance">
            <div className="bp-dashboard__cardHeader">
              <div><h2>Performance Tracker</h2><p>Sales, fulfillment, and downloads for the selected period.</p></div>
              <span className="bp-dashboard__rangePill">{data.range}{isLoading ? " · Updating…" : ""}</span>
            </div>
            <DashboardSalesChart orders={data.chartOrders} range={data.range} onRangeChange={changeRange} disabled={isLoading} />
            {error ? <p className="bp-dashboard__rangeError" role="alert">{error}</p> : null}
          </article>

          <article className="bp-dashboard__card bp-dashboard__card--system">
            <div className="bp-dashboard__cardHeader"><div><h2>System Status Check</h2><p>CMS, checkout, email, and fulfillment services.</p></div></div>
            <div className="bp-dashboard__systemList">
              {systemStatus.map((item) => (
                <div className="bp-dashboard__systemItem" key={item.label}>
                  <span className="bp-dashboard__serviceIcon" aria-hidden="true"><img alt="" height={20} src={item.logoUrl} width={20} /></span>
                  <div><strong>{item.label}</strong><small>{item.detail}</small></div>
                  <em className={item.active ? "is-active" : "is-pending"}>{item.active ? "ONLINE" : "CHECK"}</em>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="bp-dashboard__row bp-dashboard__row--wide">
          <article className="bp-dashboard__card bp-dashboard__card--recent">
            <div className="bp-dashboard__cardHeader"><div><h2>Recent Orders</h2><p>Latest checkout activity from Stripe-backed orders.</p></div><Link href="/admin/collections/orders">View all</Link></div>
            <div className="bp-dashboard__orderTable">
              {recentOrders.length ? recentOrders.map((order) => (
                <Link className="bp-dashboard__orderRow" href={order.href} key={order.id}>
                  <span><strong>{order.orderId}</strong><small>{order.customerName}</small></span>
                  <span>{order.created}</span>
                  <em className={`tone-${order.tone}`}>{order.status}</em>
                  <strong>{order.total}</strong>
                </Link>
              )) : <p className="bp-dashboard__empty">No orders yet.</p>}
            </div>
          </article>
        </div>

        <div className="bp-dashboard__row bp-dashboard__row--half">
          <article className="bp-dashboard__card bp-dashboard__card--funnel">
            <div className="bp-dashboard__cardHeader"><div><h2>Launch Funnel</h2><p>Estimated funnel snapshot for the selected period.</p></div></div>
            <div className="bp-dashboard__funnel">
              {data.funnel.map((item) => (
                <div className="bp-dashboard__funnelItem" key={item.label}>
                  <div><strong>{item.label}</strong><span>{item.value}</span></div>
                  <div className="bp-dashboard__funnelBar"><span style={{ width: `${item.width}%` }} /></div>
                </div>
              ))}
            </div>
          </article>

          <article className="bp-dashboard__card bp-dashboard__card--subscribers">
            <div className="bp-dashboard__cardHeader"><div><h2>Community Growth</h2><p>Recent subscribers and gift-led contacts.</p></div><Link href="/admin/collections/subscribers">Subscribers</Link></div>
            <div className="bp-dashboard__subscriberList">
              {latestSubscribers.length ? latestSubscribers.map((subscriber) => (
                <Link className="bp-dashboard__subscriberRow" href={subscriber.href} key={subscriber.id}>
                  <span><strong>{subscriber.name}</strong><small>{subscriber.email}</small></span>
                  <em>{subscriber.dateJoined}</em>
                  <small>{subscriber.status}</small>
                </Link>
              )) : <p className="bp-dashboard__empty">No subscribers yet.</p>}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

export default DashboardLiveAnalytics;
