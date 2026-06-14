"use client";

import React, { useMemo, useState } from "react";

export type DashboardChartOrder = {
  createdAt: string | null;
  status: string;
  total: number;
  podCount: number;
  digitalDownloadCount: number;
};

type SalesRange = "Today" | "Last 7 days" | "Last 30 days" | "Last 90 days" | "This Past Year";
type SeriesKey = "totalSales" | "podOrders" | "digitalDownloads";
type Bucket = { key: string; label: string; totalSales: number; podOrders: number; digitalDownloads: number };

const ranges: SalesRange[] = ["Today", "Last 7 days", "Last 30 days", "Last 90 days", "This Past Year"];
const series: { key: SeriesKey; label: string; className: string }[] = [
  { key: "totalSales", label: "Total Sales", className: "sales" },
  { key: "podOrders", label: "POD Orders (Lulu)", className: "pod" },
  { key: "digitalDownloads", label: "Digital Downloads", className: "digital" }
];

function emptyBucket(key: string, label: string): Bucket {
  return { key, label, totalSales: 0, podOrders: 0, digitalDownloads: 0 };
}

function dayStart(date: Date) {
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

function rangeStart(range: SalesRange) {
  const now = new Date();
  if (range === "Today") return dayStart(now);
  if (range === "Last 7 days") return addDays(dayStart(now), -6);
  if (range === "Last 30 days") return addDays(dayStart(now), -29);
  if (range === "Last 90 days") return addDays(dayStart(now), -89);
  return new Date(now.getFullYear(), now.getMonth() - 11, 1);
}

function buildEmptyBuckets(range: SalesRange) {
  const now = new Date();

  if (range === "Today") {
    return Array.from({ length: 24 }, (_, hour) => emptyBucket(String(hour), new Intl.DateTimeFormat("en-US", { hour: "numeric" }).format(new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour))));
  }

  if (range === "Last 90 days" || range === "This Past Year") {
    const start = rangeStart(range);
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    const buckets: Bucket[] = [];

    while (cursor <= end) {
      const date = new Date(cursor);
      buckets.push(emptyBucket(monthKey(date), new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return buckets;
  }

  const start = rangeStart(range);
  const days = range === "Last 7 days" ? 7 : 30;
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    return emptyBucket(dayKey(date), new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date));
  });
}

function bucketKeyForDate(date: Date, range: SalesRange) {
  if (range === "Today") return String(date.getHours());
  if (range === "Last 90 days" || range === "This Past Year") return monthKey(date);
  return dayKey(date);
}

function isSale(status: string) {
  return ["paid", "fulfilled", "complete", "completed", "shipped"].includes(status.toLowerCase());
}

function buildBuckets(orders: DashboardChartOrder[], range: SalesRange) {
  const buckets = buildEmptyBuckets(range);
  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  const start = rangeStart(range);
  const now = new Date();

  orders.forEach((order) => {
    if (!order.createdAt || !isSale(order.status)) return;
    const date = new Date(order.createdAt);
    if (Number.isNaN(date.getTime()) || date < start || date > now) return;
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

export default function DashboardSalesChart({ orders }: { orders: DashboardChartOrder[] }) {
  const [range, setRange] = useState<SalesRange>("Today");
  const buckets = useMemo(() => buildBuckets(orders, range), [orders, range]);
  const maxValue = Math.max(1, ...buckets.flatMap((bucket) => [bucket.totalSales, bucket.podOrders, bucket.digitalDownloads]));
  const labelStep = Math.max(1, Math.ceil(buckets.length / 8));

  return (
    <div className="bp-performance-tracker">
      <div className="bp-performance-tracker__toolbar">
        <div className="bp-performance-tracker__legend">
          {series.map((item) => (
            <span className={`bp-performance-tracker__legendItem bp-performance-tracker__legendItem--${item.className}`} key={item.key}>
              <i aria-hidden="true" /> {item.label}
            </span>
          ))}
        </div>
        <select aria-label="Performance period" value={range} onChange={(event) => setRange(event.target.value as SalesRange)}>
          {ranges.map((rangeOption) => <option value={rangeOption} key={rangeOption}>{rangeOption}</option>)}
        </select>
      </div>

      <div className="bp-performance-chart" role="img" aria-label={`Performance tracker for ${range}`}>
        <svg viewBox="0 0 640 260" preserveAspectRatio="none">
          <g className="bp-performance-chart__grid" aria-hidden="true">
            {[0, 1, 2, 3].map((line) => <line x1="28" x2="612" y1={24 + line * 48} y2={24 + line * 48} key={line} />)}
          </g>

          {series.map((item) => {
            const points = buildPoints(buckets, item.key, maxValue);
            return (
              <g key={item.key}>
                <polyline className={`bp-performance-chart__line bp-performance-chart__line--${item.className}`} points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
                {points.map((point) => (
                  <circle className={`bp-performance-chart__dot bp-performance-chart__dot--${item.className}`} cx={point.x} cy={point.y} r="4.5" key={`${item.key}-${point.bucket.key}`} tabIndex={0}>
                    <title>{`${point.bucket.label} · ${item.label}: ${point.value}`}</title>
                  </circle>
                ))}
              </g>
            );
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
