"use client";

import React, { useMemo } from "react";
import { DASHBOARD_RANGES, type DashboardRange, dashboardRangeWindow } from "@/lib/dashboardRanges";
import type { DashboardChartOrder } from "@/lib/dashboardAnalytics";

export type { DashboardChartOrder } from "@/lib/dashboardAnalytics";

type SeriesKey = "totalSales" | "podOrders" | "digitalDownloads";
type Bucket = { key: string; label: string; totalSales: number; podOrders: number; digitalDownloads: number };

const series: { key: SeriesKey; label: string; className: string }[] = [
  { key: "totalSales", label: "Total Sales", className: "sales" },
  { key: "podOrders", label: "POD Orders (Lulu)", className: "pod" },
  { key: "digitalDownloads", label: "Digital Downloads", className: "digital" }
];

function emptyBucket(key: string, label: string): Bucket {
  return { key, label, totalSales: 0, podOrders: 0, digitalDownloads: 0 };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function usesHourlyBuckets(range: DashboardRange) {
  return range === "Today" || range === "Yesterday";
}

function usesMonthlyBuckets(range: DashboardRange) {
  return range === "Last 90 days" || range === "Year to date" || range === "This Past Year";
}

function hasExclusiveEnd(range: DashboardRange) {
  return range === "Yesterday" || range === "Last month";
}

function buildEmptyBuckets(range: DashboardRange) {
  const now = new Date();
  const { start, end } = dashboardRangeWindow(range, now);

  if (usesHourlyBuckets(range)) {
    const base = startOfDay(start);
    return Array.from({ length: 24 }, (_, hour) => emptyBucket(String(hour), new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour))));
  }

  if (usesMonthlyBuckets(range)) {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const finalMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    const buckets: Bucket[] = [];
    while (cursor <= finalMonth) {
      const date = new Date(cursor);
      buckets.push(emptyBucket(monthKey(date), new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return buckets;
  }

  const finalDay = hasExclusiveEnd(range) ? addDays(startOfDay(end), -1) : startOfDay(end);
  const days = Math.max(1, Math.floor((finalDay.getTime() - startOfDay(start).getTime()) / 86400000) + 1);
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(startOfDay(start), index);
    return emptyBucket(dayKey(date), new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date));
  });
}

function bucketKeyForDate(date: Date, range: DashboardRange) {
  if (usesHourlyBuckets(range)) return String(date.getHours());
  if (usesMonthlyBuckets(range)) return monthKey(date);
  return dayKey(date);
}

function isSale(status: string) {
  return ["paid", "fulfilled", "complete", "completed", "shipped"].includes(status.toLowerCase());
}

function isInRange(date: Date, range: DashboardRange) {
  const { start, end } = dashboardRangeWindow(range);
  return date >= start && (hasExclusiveEnd(range) ? date < end : date <= end);
}

function buildBuckets(orders: DashboardChartOrder[], range: DashboardRange) {
  const buckets = buildEmptyBuckets(range);
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  orders.forEach((order) => {
    if (!order.createdAt || !isSale(order.status)) return;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime()) || !isInRange(date, range)) return;
    const bucket = byKey.get(bucketKeyForDate(date, range));
    if (!bucket) return;
    bucket.totalSales += 1;
    bucket.podOrders += order.podCount > 0 ? 1 : 0;
    bucket.digitalDownloads += order.digitalDownloadCount;
  });

  return buckets;
}

function buildPoints(buckets: Bucket[], key: SeriesKey, maxValue: number) {
  const width = 640;
  const height = 220;
  const paddingX = 28;
  const paddingY = 24;
  const denominator = Math.max(buckets.length - 1, 1);
  return buckets.map((bucket, index) => {
    const x = paddingX + (index / denominator) * (width - paddingX * 2);
    const y = height - paddingY - (bucket[key] / maxValue) * (height - paddingY * 2);
    return { bucket, value: bucket[key], x, y };
  });
}

export default function DashboardSalesChart({ orders, range, onRangeChange, disabled = false }: {
  orders: DashboardChartOrder[];
  range: DashboardRange;
  onRangeChange: (range: DashboardRange) => void;
  disabled?: boolean;
}) {
  const buckets = useMemo(() => buildBuckets(orders, range), [orders, range]);
  const maxValue = Math.max(1, ...buckets.flatMap((bucket) => [bucket.totalSales, bucket.podOrders, bucket.digitalDownloads]));
  const labelStep = Math.max(1, Math.ceil(buckets.length / 8));

  return (
    <div className="bp-performance-tracker" aria-busy={disabled}>
      <div className="bp-performance-tracker__toolbar">
        <div className="bp-performance-tracker__legend">
          {series.map((item) => <span className={`bp-performance-tracker__legendItem bp-performance-tracker__legendItem--${item.className}`} key={item.key}><i aria-hidden="true" /> {item.label}</span>)}
        </div>
        <select aria-label="Performance period" value={range} disabled={disabled} onChange={(event) => onRangeChange(event.target.value as DashboardRange)}>
          {DASHBOARD_RANGES.map((rangeOption) => <option value={rangeOption} key={rangeOption}>{rangeOption}</option>)}
        </select>
      </div>

      <div className="bp-performance-chart" role="img" aria-label={`Performance tracker for ${range}`}>
        <svg viewBox="0 0 640 260" preserveAspectRatio="none">
          <g className="bp-performance-chart__grid" aria-hidden="true">{[0, 1, 2, 3].map((line) => <line x1="28" x2="612" y1={24 + line * 48} y2={24 + line * 48} key={line} />)}</g>
          {series.map((item) => {
            const points = buildPoints(buckets, item.key, maxValue);
            return <g key={item.key}><polyline className={`bp-performance-chart__line bp-performance-chart__line--${item.className}`} points={points.map((point) => `${point.x},${point.y}`).join(" ")} />{points.map((point) => <circle className={`bp-performance-chart__dot bp-performance-chart__dot--${item.className}`} cx={point.x} cy={point.y} r="4.5" key={`${item.key}-${point.bucket.key}`} tabIndex={0}><title>{`${point.bucket.label} · ${item.label}: ${point.value}`}</title></circle>)}</g>;
          })}
          <g className="bp-performance-chart__axis" aria-hidden="true">
            {buckets.filter((_, index) => index % labelStep === 0).map((bucket) => {
              const index = buckets.findIndex((item) => item.key === bucket.key);
              const denominator = Math.max(buckets.length - 1, 1);
              const x = 28 + (index / denominator) * 584;
              return <text x={x} y="248" textAnchor="middle" key={bucket.key}>{bucket.label}</text>;
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
