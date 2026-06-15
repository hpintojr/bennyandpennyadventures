"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const buttonBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  padding: "0.58rem 0.9rem",
  fontSize: "0.84rem",
  fontWeight: 800,
  lineHeight: 1,
  textDecoration: "none",
  boxShadow: "0 8px 22px rgba(6, 93, 102, 0.14)"
};

export function OrderProfileActions() {
  const pathname = usePathname();
  const show = /^\/admin\/collections\/orders\/[^/]+/.test(pathname || "");

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "0.75rem",
        right: "1rem",
        zIndex: 1000,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "0.5rem",
        padding: "0.5rem",
        border: "1px solid rgba(6, 93, 102, 0.14)",
        borderRadius: "999px",
        background: "rgba(246, 253, 251, 0.96)",
        backdropFilter: "blur(12px)"
      }}
    >
      <Link
        href="/admin/collections/orders"
        style={{
          ...buttonBase,
          background: "#065d66",
          color: "#ffffff"
        }}
      >
        ← Back to Orders
      </Link>
      <Link
        href="/admin/collections/order-items"
        style={{
          ...buttonBase,
          background: "#ffffff",
          border: "1px solid rgba(6, 93, 102, 0.22)",
          color: "#065d66"
        }}
      >
        Order Details
      </Link>
    </div>
  );
}

export default OrderProfileActions;
