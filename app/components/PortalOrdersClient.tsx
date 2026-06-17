"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Shipment = {
  format: string;
  quantity: number;
  status: string;
  stage: "preparing" | "submitted" | "accepted" | "shipped" | "delivered" | "issue";
  stageIndex: number;
  trackingNumber?: string;
  trackingUrl?: string;
  submittedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
};

type PortalOrderItem = { id: string | number; title?: string; format?: string; quantity?: number; unitPrice?: number };
type PortalOrder = {
  id: string | number;
  orderNumber?: string;
  status?: string;
  subtotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  discountTotal?: number;
  total?: number;
  currency?: string;
  itemsSummary?: string;
  createdAt?: string;
  fulfillment?: string;
  shipments?: Shipment[];
  shippingAddressName?: string;
  shippingAddressLine1?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
  shippingAddressPostalCode?: string;
  shippingAddressCountry?: string;
  items?: PortalOrderItem[];
};
type PortalOrdersResponse = { orders?: PortalOrder[]; error?: string };

const STAGES: { key: Shipment["stage"]; label: string }[] = [
  { key: "submitted", label: "Sent to printer" },
  { key: "accepted", label: "In production" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" }
];

function money(value?: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatLabel(value?: string) {
  if (value === "digital") return "PDF / EPUB";
  if (value === "audiobook") return "Audiobook";
  if (value === "paperback") return "Paperback";
  if (value === "hardcover") return "Hardcover";
  return value || "Item";
}

function preview(order: PortalOrder) {
  if (order.items?.length) return order.items.map((item) => formatLabel(item.format)).join(" · ");
  return order.itemsSummary || "Order details";
}

function fulfillmentTone(label?: string) {
  if (label === "Delivered") return "bg-green text-teal";
  if (label === "Shipped") return "bg-coral/12 text-coral";
  if (label === "Needs attention") return "bg-coral/15 text-coral";
  if (label === "Refunded" || label === "Canceled") return "bg-tan/40 text-ink/70";
  return "bg-teal/10 text-teal";
}

function ShipmentTracker({ shipment }: { shipment: Shipment }) {
  if (shipment.stage === "issue") {
    return (
      <div className="rounded-2xl border border-coral/40 bg-coral/5 p-4">
        <p className="font-bold text-coral">{formatLabel(shipment.format)} × {shipment.quantity} — needs attention</p>
        <p className="mt-1 text-sm text-ink/75">This item hit a snag in production ({shipment.status}). Our team is on it — reach out via Help if you have questions.</p>
      </div>
    );
  }

  const current = shipment.stageIndex; // -1 means "preparing"
  return (
    <div className="rounded-2xl border border-tan bg-cream/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-teal">{formatLabel(shipment.format)} × {shipment.quantity}</p>
        {shipment.trackingUrl ? (
          <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-extrabold text-coral hover:text-[#d95660]">
            Track package →
          </a>
        ) : shipment.trackingNumber ? (
          <span className="text-sm font-bold text-ink/70">Tracking: {shipment.trackingNumber}</span>
        ) : null}
      </div>

      <ol className="mt-4 flex items-center">
        {STAGES.map((stage, i) => {
          const done = current >= i;
          const isCurrent = current === i;
          return (
            <li key={stage.key} className="flex flex-1 flex-col items-center text-center">
              <div className="flex w-full items-center">
                <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-coral" : "bg-tan"}`} />
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-[11px] font-extrabold ${
                    done ? "border-coral bg-coral text-white" : "border-tan bg-white text-ink/50"
                  } ${isCurrent ? "ring-4 ring-coral/15" : ""}`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={`h-0.5 flex-1 ${i === STAGES.length - 1 ? "opacity-0" : current > i ? "bg-coral" : "bg-tan"}`} />
              </div>
              <span className={`mt-1.5 text-[11px] font-bold leading-tight ${done ? "text-teal" : "text-ink/50"}`}>{stage.label}</span>
            </li>
          );
        })}
      </ol>

      {current < 0 && <p className="mt-3 text-center text-xs font-bold text-ink/60">Preparing your print order…</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-ink/55">
        {shipment.shippedAt && <span>Shipped {formatDate(shipment.shippedAt)}</span>}
        {shipment.deliveredAt && <span>Delivered {formatDate(shipment.deliveredAt)}</span>}
      </div>
    </div>
  );
}

export default function PortalOrdersClient() {
  const [orders, setOrders] = useState<PortalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      try {
        const response = await fetch("/api/portal/orders", { credentials: "include" });
        const data = (await response.json()) as PortalOrdersResponse;
        if (!response.ok) throw new Error(data.error || "Please sign in to view your orders.");
        if (active) setOrders(data.orders || []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load orders.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <p className="rounded-3xl border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-sm">Loading your orders…</p>;

  if (error) {
    return (
      <div className="rounded-3xl border border-tan bg-white/70 p-6 text-center shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-3xl border border-tan bg-white/70 p-6 text-center shadow-sm sm:p-8">
        <h2 className="font-serif text-2xl font-bold text-teal">No orders yet</h2>
        <p className="mt-3 text-ink">We didn&apos;t find any orders linked to this account yet.</p>
        <Link href="/books" className="btn mt-6">Shop Books</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order, index) => {
        const hasShipments = (order.shipments?.length || 0) > 0;
        return (
          <details key={order.id} open={index === 0} className="group overflow-hidden rounded-3xl border border-tan bg-white/75 shadow-sm">
            <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-4 transition hover:bg-cream/60 sm:px-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="break-words font-serif text-xl font-bold text-teal sm:text-2xl">#{order.orderNumber || order.id}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${fulfillmentTone(order.fulfillment)}`}>{order.fulfillment || order.status || "paid"}</span>
                </div>
                <p className="mt-1 break-words text-sm leading-6 text-ink/70">{formatDate(order.createdAt)} · {preview(order)}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-4">
                <span className="font-serif text-xl font-bold text-teal sm:text-2xl">{money(order.total, order.currency)}</span>
                <span className="text-sm font-extrabold text-coral group-open:hidden">View</span>
                <span className="hidden text-sm font-extrabold text-coral group-open:inline">Hide</span>
              </div>
            </summary>

            <div className="border-t border-tan px-4 pb-5 pt-4 sm:px-5">
              {hasShipments ? (
                <div className="mb-5 space-y-3">
                  <h3 className="font-serif text-xl font-bold text-teal">Shipping &amp; fulfillment</h3>
                  {order.shipments!.map((s, i) => (
                    <ShipmentTracker key={i} shipment={s} />
                  ))}
                </div>
              ) : (
                <div className="mb-5 rounded-2xl border border-tan bg-cream/50 p-4 text-sm text-ink/75">
                  Digital order — your files are available anytime in{" "}
                  <Link href="/portal/library" className="font-extrabold text-coral">My Library</Link>.
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
                <div className="min-w-0">
                  <h3 className="font-serif text-xl font-bold text-teal">Purchased items</h3>
                  <ul className="mt-3 space-y-2">
                    {(order.items || []).map((item) => (
                      <li key={item.id} className="rounded-2xl border border-tan bg-cream/60 p-4 text-ink">
                        <div className="break-words font-bold text-teal">{item.title}</div>
                        <div className="mt-1 text-sm leading-6">{formatLabel(item.format)} × {item.quantity || 1} — {money(item.unitPrice, order.currency)}</div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="min-w-0 rounded-2xl border border-tan bg-cream/60 p-4 sm:p-5">
                  <h3 className="font-serif text-xl font-bold text-teal">Summary</h3>
                  <dl className="mt-4 space-y-2 text-sm text-ink">
                    <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{money(order.subtotal, order.currency)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Tax</dt><dd>{money(order.taxTotal, order.currency)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Shipping</dt><dd>{money(order.shippingTotal, order.currency)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Discount</dt><dd>{money(order.discountTotal, order.currency)}</dd></div>
                    <div className="flex justify-between gap-4 border-t border-tan pt-3 text-base font-extrabold text-teal"><dt>Total</dt><dd>{money(order.total, order.currency)}</dd></div>
                  </dl>

                  {order.shippingAddressLine1 && (
                    <div className="mt-5 border-t border-tan pt-4 text-sm leading-6 text-ink">
                      <h4 className="font-bold text-teal">Shipping to</h4>
                      <p>{order.shippingAddressName}</p>
                      <p>{order.shippingAddressLine1}</p>
                      <p>{order.shippingAddressCity}, {order.shippingAddressState} {order.shippingAddressPostalCode}</p>
                      <p>{order.shippingAddressCountry}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
