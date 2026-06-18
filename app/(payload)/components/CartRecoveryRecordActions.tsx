"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

function cartIdFromPath(pathname: string | null) {
  const match = pathname?.match(/^\/admin\/collections\/abandoned-carts\/([^/]+)/);
  return match?.[1] || "";
}

export function CartRecoveryRecordActions() {
  const pathname = usePathname();
  const router = useRouter();
  const cartId = cartIdFromPath(pathname);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");

  if (!cartId) return null;

  async function run(action: "dry-run-cart" | "send-test-reminder") {
    const prompt = action === "dry-run-cart"
      ? "Run an email-safe recovery test for this cart? This can set the record to Abandoned and sync eligible tags, but it will not send an email."
      : "Send one controlled reminder to this cart's consented email address?";
    if (!window.confirm(prompt)) return;

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
      setMessage(action === "dry-run-cart" ? "Email-safe recovery test complete. The form will refresh now." : "Controlled reminder request completed. Check the mailbox and Recovery State.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recovery action failed.");
    } finally {
      setWorking("");
    }
  }

  return (
    <section style={{ background: "#eefaf8", border: "1px solid rgba(6,93,102,.18)", borderRadius: "14px", margin: "0 0 1rem", padding: "1rem" }}>
      <strong style={{ color: "#065d66", display: "block", fontSize: "1rem" }}>Cart Recovery Controls</strong>
      <p style={{ color: "#50676c", fontSize: ".84rem", margin: ".35rem 0 .8rem" }}>Run a safe recovery-state test, or send one controlled reminder only after email delivery is intentionally enabled in Vercel.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".55rem" }}>
        <button type="button" disabled={Boolean(working)} onClick={() => void run("dry-run-cart")}>{working === "dry-run-cart" ? "Running…" : "Run email-safe test"}</button>
        <button type="button" disabled={Boolean(working)} onClick={() => void run("send-test-reminder")}>{working === "send-test-reminder" ? "Sending…" : "Send controlled reminder"}</button>
      </div>
      <small style={{ color: "#50676c", display: "block", marginTop: ".65rem" }}>{message || "While CART_RECOVERY_SEND_ENABLED=false, a reminder send request is blocked by the server."}</small>
    </section>
  );
}

export default CartRecoveryRecordActions;
