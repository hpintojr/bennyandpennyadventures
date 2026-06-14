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

function getRangeDays(range: SalesRange) {
  if (range === "Today" || range === "This Past Year") return null;
  return Number(range.match(/\d+/)?.[0] || 30);
}

function shouldGroupByWeek(range: SalesRange) {
  const days = getRangeDays(range);
  return Boolean(days && days >= 14 && days <= 60);
}

function shouldGroupByMonth(range: SalesRange) {
  if (range === "This Past Year") return true;
  const days = getRangeDays(range);
  return Boolean(days && days > 60);
}

function buildWeeklyBucketsForRange(range: SalesRange): SalesBucket[] {
  const now = new Date();
  const days = getRangeDays(range) || 30;
  const start = addDays(startOfDay(now), -(days - 1));
  const buckets: SalesBucket[] = [];

  for (let weekIndex = 0, cursor = new Date(start); cursor <= now; weekIndex += 1, cursor = addDays(start, weekIndex * 7)) {
    const weekStart = new Date(cursor);
    const weekEnd = addDays(weekStart, 6);
    const displayEnd = weekEnd > now ? now : weekEnd;

    buckets.push({
      key: dateKey(weekStart),
      label: `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(weekStart)}-${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(displayEnd)}`,
      revenue: 0,
      orders: 0
    });
  }

  return buckets;
}

function buildMonthlyBucketsForRange(range: SalesRange): SalesBucket[] {
  const now = new Date();
  const start = range === "This Past Year"
    ? new Date(now.getFullYear(), now.getMonth() - 11, 1)
    : addDays(startOfDay(now), -((getRangeDays(range) || 30) - 1));

  const buckets: SalesBucket[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  while (cursor <= end) {
    const date = new Date(cursor);
    buckets.push({
      key: monthKey(date),
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
      revenue: 0,
      orders: 0
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
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

  if (shouldGroupByWeek(range)) {
    return buildWeeklyBucketsForRange(range);
  }

  if (shouldGroupByMonth(range)) {
    return buildMonthlyBucketsForRange(range);
  }

  const days = getRangeDays(range) || 30;
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

function getWeekBucketKey(date: Date, range: SalesRange) {
  const days = getRangeDays(range) || 30;
  const start = addDays(startOfDay(new Date()), -(days - 1));
  const dayDifference = Math.floor((startOfDay(date).getTime() - start.getTime()) / 86400000);
  const weekStart = addDays(start, Math.floor(Math.max(0, dayDifference) / 7) * 7);
  return dateKey(weekStart);
}

function orderKeyForRange(date: Date, range: SalesRange) {
  if (range === "Today") return String(date.getHours());
  if (shouldGroupByWeek(range)) return getWeekBucketKey(date, range);
  if (shouldGroupByMonth(range)) return monthKey(date);
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

  const days = getRangeDays(range) || 30;
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
        style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(64px, 1fr))` }}
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
