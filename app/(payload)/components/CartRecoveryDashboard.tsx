import config from "@payload-config";
import Link from "next/link";
import { getPayload } from "payload";
import { getCartRecoveryConfig } from "@/lib/cartRecoveryAutomation";
import CartRecoveryActions from "./CartRecoveryActions";
import CartRecoveryTestConsole from "./CartRecoveryTestConsole";
import "./CartRecoveryDashboard.scss";

type PayloadDoc = { id?: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

function date(value: unknown) {
  if (typeof value !== "string") return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(parsed);
}

function paid(order: PayloadDoc) {
  return ["paid", "fulfilled", "complete", "completed", "shipped"].includes(text(order.status).toLowerCase());
}

function cartName(cart: PayloadDoc) {
  return text(cart.email, "No email");
}

function cartState(cart: PayloadDoc) {
  return text(cart.recoveryState, "not-eligible");
}

function stateLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isRecovered(cart: PayloadDoc) {
  return cartState(cart) === "recovered" || (text(cart.status) === "converted" && Boolean(cart.abandonedAt));
}

export async function CartRecoveryDashboard() {
  const payload = await getPayload({ config });
  const [cartsResult, ordersResult, giftsResult] = await Promise.all([
    payload.find({ collection: "abandoned-carts", overrideAccess: true, depth: 0, limit: 500, sort: "-lastActivityAt" }) as Promise<PayloadFindResult>,
    payload.find({ collection: "orders", overrideAccess: true, depth: 0, limit: 500, sort: "-createdAt" }) as Promise<PayloadFindResult>,
    payload.find({ collection: "gifts", overrideAccess: true, depth: 0, limit: 500, sort: "-createdAt" }) as Promise<PayloadFindResult>
  ]);

  const carts = cartsResult.docs || [];
  const orders = ordersResult.docs || [];
  const gifts = giftsResult.docs || [];
  const completedOrders = orders.filter(paid);
  const abandoned = carts.filter((cart) => text(cart.status) === "abandoned");
  const eligible = abandoned.filter((cart) => cart.recoveryEligible === true);
  const recovered = carts.filter(isRecovered);
  const couponOrders = completedOrders.filter((order) => Boolean(text(order.couponCode)) || number(order.discountTotal) > 0);
  const bpgOrders = completedOrders.filter((order) => Boolean(text(order.bpgCode)) || /^BPG/i.test(text(order.giftCode)));
  const configState = getCartRecoveryConfig();

  const testCarts = carts.slice(0, 30).map((cart) => ({
    id: cart.id || "",
    label: `${cartName(cart)} — ${text(cart.status, "active-cart")} — ${money(number(cart.subtotal))}`,
    eligible: cart.recoveryEligible === true,
    status: text(cart.status, "active-cart")
  })).filter((cart) => Boolean(cart.id));

  return (
    <section className="bp-recovery-dashboard" aria-label="Cart recovery center">
      <div className="bp-recovery-dashboard__shell">
        <header className="bp-recovery-dashboard__header">
          <div>
            <h2>Cart Recovery Center</h2>
            <p>Operational controls, recovery pipeline, campaign attribution, and revenue follow-through.</p>
          </div>
          <div className="bp-recovery-dashboard__headerRight">
            <span className={`bp-recovery-dashboard__mode ${configState.emailsEnabled ? "is-live" : ""}`}>{configState.emailsEnabled ? "Email delivery enabled" : "Email-safe dry run"}</span>
            <CartRecoveryActions />
          </div>
        </header>

        <div className="bp-recovery-dashboard__metrics">
          <article className="bp-recovery-dashboard__metric"><span>Abandoned</span><strong>{abandoned.length}</strong><small>{eligible.length} eligible now</small></article>
          <article className="bp-recovery-dashboard__metric"><span>Awaiting reminder</span><strong>{carts.filter((cart) => cartState(cart) === "eligible").length}</strong><small>Consent-based only</small></article>
          <article className="bp-recovery-dashboard__metric"><span>Reminder pipeline</span><strong>{carts.filter((cart) => ["reminder-1-sent", "reminder-2-sent"].includes(cartState(cart))).length}</strong><small>{carts.filter((cart) => cartState(cart) === "reminder-2-sent").length} follow-ups sent</small></article>
          <article className="bp-recovery-dashboard__metric"><span>Recovered revenue</span><strong>{money(recovered.reduce((sum, cart) => sum + number(cart.recoveredRevenue), 0))}</strong><small>{recovered.length} recovered cart(s)</small></article>
        </div>

        <div className="bp-recovery-dashboard__grid">
          <article className="bp-recovery-dashboard__card">
            <h3>Recovery queue</h3>
            <dl>
              <div><dt>Eligible now</dt><dd>{eligible.length}</dd></div>
              <div><dt>Reminder 1 sent</dt><dd>{carts.filter((cart) => cartState(cart) === "reminder-1-sent").length}</dd></div>
              <div><dt>Suppressed / unsubscribed</dt><dd>{carts.filter((cart) => cartState(cart) === "suppressed").length}</dd></div>
            </dl>
          </article>
          <article className="bp-recovery-dashboard__card">
            <h3>Campaign &amp; gift attribution</h3>
            <dl>
              <div><dt>Coupon carts / revenue</dt><dd>{carts.filter((cart) => Boolean(text(cart.couponCode))).length} · {money(couponOrders.reduce((sum, order) => sum + number(order.total), 0))}</dd></div>
              <div><dt>BPG carts / revenue</dt><dd>{carts.filter((cart) => Boolean(text(cart.bpgCode)) || /^BPG/i.test(text(cart.giftCode))).length} · {money(bpgOrders.reduce((sum, order) => sum + number(order.total), 0))}</dd></div>
              <div><dt>Gifts sent / redeemed</dt><dd>{gifts.filter((gift) => text(gift.status) === "sent").length} · {gifts.filter((gift) => text(gift.status) === "redeemed").length}</dd></div>
            </dl>
          </article>
          <article className="bp-recovery-dashboard__card">
            <h3>Controlled validation</h3>
            <CartRecoveryTestConsole carts={testCarts} emailsEnabled={configState.emailsEnabled} />
          </article>
        </div>

        <div className="bp-recovery-dashboard__toolbar">
          <div>
            <h3>Recovery queue filters</h3>
            <p>Open a focused worklist in Abandoned Carts.</p>
          </div>
          <div className="bp-recovery-dashboard__links">
            <Link href="/admin/collections/abandoned-carts?where[status][equals]=abandoned">Abandoned</Link>
            <Link href="/admin/collections/abandoned-carts?where[recoveryEligible][equals]=true">Eligible</Link>
            <Link href="/admin/collections/abandoned-carts?where[recoveryState][equals]=reminder-1-sent">Reminder 1</Link>
            <Link href="/admin/collections/abandoned-carts?where[recoveryState][equals]=reminder-2-sent">Reminder 2</Link>
            <Link href="/admin/collections/abandoned-carts?where[recoveryState][equals]=recovered">Recovered</Link>
            <Link href="/admin/collections/abandoned-carts?where[recoveryState][equals]=suppressed">Suppressed</Link>
          </div>
        </div>

        <div className="bp-recovery-dashboard__tableWrap">
          <table>
            <thead><tr><th>Email</th><th>Recovery state</th><th>Cart &amp; source</th><th>Value</th><th>Last activity</th></tr></thead>
            <tbody>
              {carts.slice(0, 10).map((cart) => {
                const state = cartState(cart);
                const item = text(cart.itemsSummary).split("\n")[0] || "Cart items";
                const source = [text(cart.couponCode) && `Coupon: ${text(cart.couponCode)}`, text(cart.bpgCode) && `BPG: ${text(cart.bpgCode)}`, text(cart.giftCode) && `Gift: ${text(cart.giftCode)}`].filter(Boolean).join(" · ") || "No campaign code";
                return <tr key={String(cart.id)}>
                  <td><Link href={`/admin/collections/abandoned-carts/${cart.id}`}>{cartName(cart)}</Link><small>{cart.recoveryEligible === true ? "Consent confirmed" : "Not outreach eligible"}</small></td>
                  <td><span className={`bp-recovery-dashboard__status ${state === "suppressed" ? "is-suppressed" : ""} ${state === "recovered" ? "is-recovered" : ""}`}>{stateLabel(state)}</span><small>{text(cart.recoveredOrderNumber) ? `Order ${text(cart.recoveredOrderNumber)}` : text(cart.abandonedAt) ? `Abandoned ${date(cart.abandonedAt)}` : stateLabel(text(cart.status, "active-cart"))}</small></td>
                  <td><strong>{item}</strong><small>{source}</small></td>
                  <td><strong>{money(number(cart.subtotal))}</strong><small>{number(cart.recoveredRevenue) ? `Recovered ${money(number(cart.recoveredRevenue))}` : "—"}</small></td>
                  <td>{date(cart.lastActivityAt)}</td>
                </tr>;
              })}
              {!carts.length ? <tr><td colSpan={5}>No cart records yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default CartRecoveryDashboard;
