"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Overview = {
  config?: { emailsEnabled?: boolean; activeCartHours?: number; checkoutStartedHours?: number; secondReminderHours?: number };
  metrics?: { abandoned?: number; eligible?: number; awaitingFirstReminder?: number; firstReminderSent?: number; secondReminderSent?: number; suppressed?: number; recoveredCarts?: number; recoveredRevenue?: number; couponCarts?: number; couponRevenue?: number; bpgCarts?: number; bpgRevenue?: number; giftsSent?: number; giftsRedeemed?: number };
};

function cartIdFromPath(pathname: string | null) {
  return pathname?.match(/^\/admin\/collections\/abandoned-carts\/([^/]+)/)?.[1] || "";
}

function money(value?: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

export function CartRecoveryRecordActions() {
  const pathname = usePathname();
  const router = useRouter();
  const cartId = cartIdFromPath(pathname);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  const [overview, setOverview] = useState<Overview>({});

  useEffect(() => {
    fetch("/api/admin/cart-recovery", { credentials: "include", cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setOverview(data as Overview); })
      .catch(() => null);
  }, []);

  if (!cartId) return null;

  async function run(action: "dry-run-cart" | "send-test-reminder") {
    const safe = action === "dry-run-cart";
    if (!window.confirm(safe ? "Run an email-safe recovery test for this cart?" : "Send one controlled reminder to this cart's consented email address?")) return;
    setWorking(action);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cart-recovery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cartId })
      });
      const data = (await response.json()) as { error?: string; result?: { reason?: string } };
      if (!response.ok) throw new Error(data.result?.reason || data.error || "Recovery action failed.");
      setMessage(safe ? "Email-safe recovery test complete. The form will refresh now." : "Controlled reminder request completed. Check the mailbox and Recovery State.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recovery action failed.");
    } finally {
      setWorking("");
    }
  }

  const m = overview.metrics;
  return (
    <section style={{ background: "#eefaf8", border: "1px solid rgba(6,93,102,.18)", borderRadius: "14px", margin: "0 0 1rem", padding: "1rem" }}>
      <strong style={{ color: "#065d66", display: "block" }}>Cart Recovery Controls</strong>
      <p style={{ color: "#50676c", fontSize: ".84rem" }}>Use the safe test first. Controlled reminder delivery remains blocked until enabled in Vercel.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem" }}>
        <button type="button" disabled={Boolean(working)} onClick={() => void run("dry-run-cart")}>{working === "dry-run-cart" ? "Running…" : "Run email-safe test"}</button>
        <button type="button" disabled={Boolean(working)} onClick={() => void run("send-test-reminder")}>{working === "send-test-reminder" ? "Sending…" : "Send controlled reminder"}</button>
        <Link href="/admin/collections/abandoned-carts?where[recoveryEligible][equals]=true">Eligible worklist →</Link>
      </div>
      <small style={{ color: "#50676c", display: "block", marginTop: ".65rem" }}>{message || (overview.config?.emailsEnabled ? "Email delivery is enabled; use only a consented test cart." : "Email-safe dry run is active.")}</small>
      {m ? <p style={{ color: "#065d66", fontSize: ".8rem", marginTop: ".8rem" }}>Abandoned: {m.abandoned || 0} · Eligible: {m.eligible || 0} · Reminders: {(m.firstReminderSent || 0) + (m.secondReminderSent || 0)} · Recovered: {money(m.recoveredRevenue)} · Coupon: {m.couponCarts || 0} / {money(m.couponRevenue)} · BPG: {m.bpgCarts || 0} / {money(m.bpgRevenue)} · Gifts: {m.giftsSent || 0} / {m.giftsRedeemed || 0} · Suppressed: {m.suppressed || 0}</p> : null}
    </section>
  );
}

export default CartRecoveryRecordActions;
