"use client";

import { useMemo, useState } from "react";

type CartOption = { id: string | number; label: string; eligible: boolean; status: string };

type Props = { carts: CartOption[]; emailsEnabled: boolean };

export function CartRecoveryTestConsole({ carts, emailsEnabled }: Props) {
  const available = useMemo(() => carts.filter((cart) => !["converted", "dismissed", "recovered"].includes(cart.status)), [carts]);
  const [cartId, setCartId] = useState<string>(available[0] ? String(available[0].id) : "");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  async function act(action: "dry-run-cart" | "send-test-reminder") {
    if (!cartId) return;
    const prompt = action === "dry-run-cart"
      ? "Run an email-safe recovery test on this cart? It may update the record to Abandoned but will not send email."
      : "Send one controlled reminder to the selected consented cart email?";
    if (!window.confirm(prompt)) return;

    setWorking(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/cart-recovery", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cartId })
      });
      const data = (await response.json()) as { error?: string; result?: { reason?: string } };
      if (!response.ok) throw new Error(data.result?.reason || data.error || "Recovery test failed.");
      setMessage(action === "dry-run-cart" ? "Recovery test completed. Refresh the dashboard or open the cart record to review its state." : "Reminder request completed. Check the mailbox and cart record.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Recovery test failed.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="bp-recovery-test-console">
      <label htmlFor="bp-recovery-cart">Controlled test cart</label>
      <select id="bp-recovery-cart" value={cartId} onChange={(event) => setCartId(event.target.value)} disabled={!available.length || working}>
        {available.length ? available.map((cart) => <option key={String(cart.id)} value={String(cart.id)}>{cart.label}</option>) : <option value="">No open carts available</option>}
      </select>
      <div>
        <button type="button" disabled={!cartId || working} onClick={() => void act("dry-run-cart")}>{working ? "Working…" : "Run safe cart test"}</button>
        <button type="button" disabled={!cartId || working || !emailsEnabled} title={emailsEnabled ? "Send one controlled reminder." : "Email delivery is disabled in Vercel."} onClick={() => void act("send-test-reminder")}>{emailsEnabled ? "Send controlled reminder" : "Reminder delivery disabled"}</button>
      </div>
      <small>{message || (emailsEnabled ? "Delivery is enabled. Use only with a consented test cart." : "Email delivery is off. Safe tests update state and Sequenzy only.")}</small>
    </div>
  );
}

export default CartRecoveryTestConsole;
