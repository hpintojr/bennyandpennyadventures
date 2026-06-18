"use client";

import { useState } from "react";

export function CartRecoveryActions() {
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);

  async function runSweep() {
    if (!window.confirm("Run the email-safe overdue-cart sweep? This updates qualifying cart records but does not deliver recovery emails.")) return;
    setRunning(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cart-recovery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sweep" })
      });
      const data = (await response.json()) as { error?: string; result?: { markedAbandoned?: number } };
      if (!response.ok) throw new Error(data.error || "Recovery sweep failed.");
      setMessage(`Sweep complete: ${data.result?.markedAbandoned || 0} cart(s) marked abandoned. Refresh the dashboard to view changes.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recovery sweep failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="bp-recovery-actions">
      <button type="button" onClick={() => void runSweep()} disabled={running}>{running ? "Running…" : "Run email-safe overdue sweep"}</button>
      {message ? <small>{message}</small> : <small>No recovery email is sent while email delivery remains disabled.</small>}
    </div>
  );
}

export default CartRecoveryActions;
