import Link from "next/link";
import React from "react";

const buttonBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  padding: "0.7rem 1rem",
  fontSize: "0.9rem",
  fontWeight: 700,
  lineHeight: 1,
  textDecoration: "none",
  transition: "all 160ms ease"
};

export function OrderProfileActions() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "0 0 1.25rem",
        padding: "1rem",
        border: "1px solid rgba(6, 93, 102, 0.18)",
        borderRadius: "1rem",
        background: "rgba(249, 240, 226, 0.72)"
      }}
    >
      <div>
        <div style={{ color: "#065d66", fontWeight: 800, fontSize: "1rem" }}>Order Profile</div>
        <div style={{ color: "rgba(38, 56, 60, 0.72)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
          Quick navigation for orders, order details, customers, and addresses.
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
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
            border: "1px solid rgba(6, 93, 102, 0.24)",
            color: "#065d66"
          }}
        >
          Order Details
        </Link>
      </div>
    </div>
  );
}

export default OrderProfileActions;
