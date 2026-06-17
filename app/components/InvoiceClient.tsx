"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type InvoiceItem = { id: string | number; title?: string; format?: string; quantity?: number; unitPrice?: number };
type InvoiceOrder = {
  id: string | number;
  orderNumber?: string;
  status?: string;
  subtotal?: number;
  taxTotal?: number;
  shippingTotal?: number;
  discountTotal?: number;
  total?: number;
  currency?: string;
  createdAt?: string;
  customerName?: string;
  customerEmail?: string;
  billingAddressName?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingAddressCity?: string;
  billingAddressState?: string;
  billingAddressPostalCode?: string;
  billingAddressCountry?: string;
  shippingAddressName?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingAddressCity?: string;
  shippingAddressState?: string;
  shippingAddressPostalCode?: string;
  shippingAddressCountry?: string;
  items?: InvoiceItem[];
};

// Company details — the ONLY place the business address is shown for now.
const COMPANY = {
  name: "Benny & Penny's Adventures",
  tagline: "Medical books for brave little hearts",
  lines: ["231 E Alessandro Blvd", "Ste A-208", "Riverside, CA 92508", "United States"],
  email: "hello@bennyandpennyadventures.com",
  site: "bennyandpennyadventures.com"
};

function money(value?: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(value || 0);
}

function longDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatLabel(value?: string) {
  if (value === "digital") return "PDF / EPUB";
  if (value === "audiobook") return "Audiobook";
  if (value === "paperback") return "Paperback";
  if (value === "hardcover") return "Hardcover";
  return value || "Item";
}

function hasAddress(o: InvoiceOrder, p: "billingAddress" | "shippingAddress") {
  return Boolean(o[`${p}Line1`]);
}

function AddressBlock({ o, prefix, fallbackName }: { o: InvoiceOrder; prefix: "billingAddress" | "shippingAddress"; fallbackName?: string }) {
  return (
    <div className="text-sm leading-6 text-[#1d3237]">
      <p className="font-bold">{o[`${prefix}Name`] || fallbackName || "—"}</p>
      <p>{o[`${prefix}Line1`]}</p>
      {o[`${prefix}Line2`] && <p>{o[`${prefix}Line2`]}</p>}
      <p>
        {o[`${prefix}City`]}, {o[`${prefix}State`]} {o[`${prefix}PostalCode`]}
      </p>
      <p>{o[`${prefix}Country`]}</p>
    </div>
  );
}

export default function InvoiceClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<InvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/portal/orders", { credentials: "include" });
        const json = (await res.json()) as { orders?: InvoiceOrder[]; error?: string };
        if (!res.ok) throw new Error(json.error || "Please sign in to view this invoice.");
        const found = (json.orders || []).find((o) => String(o.id) === String(orderId));
        if (!found) throw new Error("We couldn't find that order on your account.");
        if (alive) setOrder(found);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Could not load this invoice.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [orderId]);

  if (loading) {
    return <div className="mx-auto max-w-2xl p-10 text-center font-bold text-[#064852]">Preparing your invoice…</div>;
  }
  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <p className="text-[#1d3237]">{error || "Invoice unavailable."}</p>
        <Link href="/portal/orders" className="mt-4 inline-block font-extrabold text-[#e7646c]">← Back to orders</Link>
      </div>
    );
  }

  const billing = hasAddress(order, "billingAddress");
  const shipping = hasAddress(order, "shippingAddress");

  return (
    <div className="min-h-screen bg-[#fff6e8] py-8 text-[#1d3237] print:bg-white print:py-0">
      {/* Action bar — hidden when printing */}
      <div className="mx-auto mb-5 flex max-w-3xl items-center justify-between px-5 print:hidden">
        <Link href="/portal/orders" className="text-sm font-extrabold text-[#064852] hover:text-[#e7646c]">← Back to orders</Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-[#e7646c] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#d95660]"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* Invoice sheet */}
      <div className="mx-auto max-w-3xl bg-white px-7 py-9 shadow-sm print:max-w-none print:px-0 print:shadow-none sm:px-10">
        <header className="flex flex-col gap-4 border-b-2 border-[#e8cfae] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-serif text-2xl font-bold text-[#064852]">
              <span className="text-[#e7646c]">♥</span> {COMPANY.name}
            </p>
            <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.12em] text-[#e7646c]">{COMPANY.tagline}</p>
            <div className="mt-3 text-sm leading-6 text-[#1d3237]/80">
              {COMPANY.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <p className="mt-1">{COMPANY.email}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="font-serif text-3xl font-bold text-[#064852]">Invoice</p>
            <p className="mt-1 text-sm">
              <span className="font-bold">#{order.orderNumber || order.id}</span>
            </p>
            <p className="text-sm text-[#1d3237]/70">{longDate(order.createdAt)}</p>
            <p className="mt-2 inline-block rounded-full bg-[#eef2e6] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[#064852]">
              {order.status || "paid"}
            </p>
          </div>
        </header>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#e7646c]">Bill to</p>
            <div className="mt-2">
              {billing ? (
                <AddressBlock o={order} prefix="billingAddress" fallbackName={order.customerName || order.customerEmail} />
              ) : (
                <div className="text-sm leading-6">
                  <p className="font-bold">{order.customerName || "Customer"}</p>
                  {order.customerEmail && <p>{order.customerEmail}</p>}
                </div>
              )}
            </div>
          </div>
          {shipping && (
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#e7646c]">Ship to</p>
              <div className="mt-2">
                <AddressBlock o={order} prefix="shippingAddress" fallbackName={order.customerName} />
              </div>
            </div>
          )}
        </section>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-[#e8cfae] text-left">
              <th className="py-2 font-extrabold text-[#064852]">Item</th>
              <th className="py-2 font-extrabold text-[#064852]">Format</th>
              <th className="py-2 text-center font-extrabold text-[#064852]">Qty</th>
              <th className="py-2 text-right font-extrabold text-[#064852]">Unit</th>
              <th className="py-2 text-right font-extrabold text-[#064852]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id} className="border-b border-[#e8cfae]/60">
                <td className="py-2.5 pr-2 font-bold text-[#1d3237]">{item.title}</td>
                <td className="py-2.5 pr-2 text-[#1d3237]/80">{formatLabel(item.format)}</td>
                <td className="py-2.5 text-center text-[#1d3237]/80">{item.quantity || 1}</td>
                <td className="py-2.5 text-right text-[#1d3237]/80">{money(item.unitPrice, order.currency)}</td>
                <td className="py-2.5 text-right font-bold text-[#1d3237]">{money((item.unitPrice || 0) * (item.quantity || 1), order.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-[#1d3237]/70">Subtotal</dt><dd>{money(order.subtotal, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#1d3237]/70">Tax</dt><dd>{money(order.taxTotal, order.currency)}</dd></div>
            <div className="flex justify-between"><dt className="text-[#1d3237]/70">Shipping</dt><dd>{money(order.shippingTotal, order.currency)}</dd></div>
            {Boolean(order.discountTotal) && (
              <div className="flex justify-between"><dt className="text-[#1d3237]/70">Discount</dt><dd>−{money(order.discountTotal, order.currency)}</dd></div>
            )}
            <div className="flex justify-between border-t-2 border-[#e8cfae] pt-2 text-base font-extrabold text-[#064852]">
              <dt>Total</dt>
              <dd>{money(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>

        <footer className="mt-10 border-t border-[#e8cfae] pt-5 text-center text-xs text-[#1d3237]/60">
          <p className="font-bold text-[#064852]">Thank you for supporting brave little hearts ♥</p>
          <p className="mt-1">{COMPANY.name} · {COMPANY.site}</p>
          <p>Questions about this invoice? Email {COMPANY.email}.</p>
        </footer>
      </div>
    </div>
  );
}
