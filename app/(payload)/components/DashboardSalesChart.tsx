"use client";

import React, { useMemo, useState } from "react";

export type DashboardChartOrder = {
  createdAt: string | null;
  status: string;
  total: number;
};

type SalesRange =
  | "Today"
  | "Last 3 days"
  | "Last 7 days"
  | "Last 14 days"
  | "Last 30 days"
  | "Last 45 days"
  | "Last 60 days"
  | "Last 90 days"
  | "Last 120 days"
  | "This Past Year";

type SalesBucket = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

const salesRanges: SalesRange[] = [
  "Today",
  "Last 3 days",
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "Last 45 days",
  "Last 60 days",
  "Last 90 days",
  "Last 120 days",
  "This Past Year"
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { currency: "USD", style: "currency" }).format(value);
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildEmptyBuckets(range: SalesRange): SalesBucket[] {
  const now = new Date();

  if (range === "Today") {
    return Array.from({ length: 24 }, (_, hour) => {
      const labelDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour);
      return {
        key: String(hour),
        label: new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(labelDate),
        revenue: 0,
        orders: 0
      };
    });
  }

  if (range === "This Past Year") {
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
      return {
        key: monthKey(date),
        label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
        revenue: 0,
        orders: 0
      };
    });
  }

  const days = Number(range.match(/\d+/)?.[0] || 30);
  const start = addDays(startOfDay(now), -(days - 1));

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    return {
      key: dateKey(date),
      label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date),
      revenue: 0,
      orders: 0
    };
  });
}

function orderKeyForRange(date: Date, range: SalesRange) {
  if (range === "Today") return String(date.getHours());
  if (range === "This Past Year") return monthKey(date);
  return dateKey(date);
}

function isWithinRange(date: Date, range: SalesRange) {
  const now = new Date();

  if (range === "Today") {
    return date >= startOfDay(now) && date <= now;
  }

  if (range === "This Past Year") {
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    return date >= start && date <= now;
  }

  const days = Number(range.match(/\d+/)?.[0] || 30);
  const start = addDays(startOfDay(now), -(days - 1));
  return date >= start && date <= now;
}

function buildBuckets(orders: DashboardChartOrder[], range: SalesRange) {
  const buckets = buildEmptyBuckets(range);
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const order of orders) {
    if (!order.createdAt || order.status.toLowerCase() !== "paid") continue;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime()) || !isWithinRange(date, range)) continue;

    const bucket = byKey.get(orderKeyForRange(date, range));
    if (!bucket) continue;

    bucket.orders += 1;
    bucket.revenue += order.total;
  }

  const maxRevenue = Math.max(...buckets.map((bucket) => bucket.revenue), 1);

  return buckets.map((bucket) => ({
    ...bucket,
    height: bucket.revenue > 0 ? Math.max(10, Math.round((bucket.revenue / maxRevenue) * 100)) : 4,
    tooltip: `${bucket.label}: ${formatMoney(bucket.revenue)} · ${bucket.orders} orders`
  }));
}

export default function DashboardSalesChart({ orders }: { orders: DashboardChartOrder[] }) {
  const [range, setRange] = useState<SalesRange>("Last 30 days");
  const buckets = useMemo(() => buildBuckets(orders, range), [orders, range]);

  return (
    <>
      <select aria-label="Sales period" value={range} onChange={(event) => setRange(event.target.value as SalesRange)}>
        {salesRanges.map((rangeOption) => <option value={rangeOption} key={rangeOption}>{rangeOption}</option>)}
      </select>

      <div
        className="bp-dashboard__chart"
        aria-label={`Sales performance for ${range}`}
        style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(28px, 1fr))` }}
      >
        {buckets.map((bar) => (
          <div
            className="bp-dashboard__barWrap"
            data-tooltip={bar.tooltip}
            key={bar.key}
            tabIndex={0}
            title={bar.tooltip}
          >
            <span style={{ height: `${bar.height}%` }} />
            <small>{bar.label}</small>
          </div>
        ))}
      </div>
    </>
  );
}
