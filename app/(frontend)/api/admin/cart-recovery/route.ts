import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { getCartRecoveryConfig, runCartRecoveryAutomation, sendManualCartRecoveryReminder } from "@/lib/cartRecoveryAutomation";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [key: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[]; totalDocs?: number };

type ActionBody = {
  action?: unknown;
  cartId?: unknown;
  reminder?: unknown;
};

function number(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function string(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function id(value: unknown): string | number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function isPaid(status: unknown) {
  return ["paid", "fulfilled", "complete", "completed", "shipped"].includes(string(status).toLowerCase());
}

async function requireAdmin() {
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: await getHeaders() });
  const user = auth.user as PayloadDoc | null | undefined;
  if (!user?.id || user.role !== "admin") return { payload, user: null };
  return { payload, user };
}

function cartRow(cart: PayloadDoc) {
  return {
    id: cart.id,
    email: string(cart.email, "No email"),
    status: string(cart.status, "active-cart"),
    recoveryEligible: cart.recoveryEligible === true,
    recoveryState: string(cart.recoveryState, "not-eligible"),
    itemsSummary: string(cart.itemsSummary, "Cart items"),
    subtotal: number(cart.subtotal),
    couponCode: string(cart.couponCode),
    giftCode: string(cart.giftCode),
    bpgCode: string(cart.bpgCode),
    abandonedAt: string(cart.abandonedAt),
    firstReminderSentAt: string(cart.firstReminderSentAt),
    secondReminderSentAt: string(cart.secondReminderSentAt),
    lastReminderSentAt: string(cart.lastReminderSentAt),
    recoveredOrderNumber: string(cart.recoveredOrderNumber),
    recoveredRevenue: number(cart.recoveredRevenue),
    lastActivityAt: string(cart.lastActivityAt)
  };
}

export async function GET() {
  const { payload, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [cartResult, orderResult, giftResult] = await Promise.all([
      payload.find({ collection: "abandoned-carts", overrideAccess: true, depth: 0, limit: 500, sort: "-lastActivityAt" }) as Promise<PayloadFindResult>,
      payload.find({ collection: "orders", overrideAccess: true, depth: 0, limit: 500, sort: "-createdAt" }) as Promise<PayloadFindResult>,
      payload.find({ collection: "gifts", overrideAccess: true, depth: 0, limit: 500, sort: "-createdAt" }) as Promise<PayloadFindResult>
    ]);

    const carts = cartResult.docs || [];
    const orders = orderResult.docs || [];
    const gifts = giftResult.docs || [];
    const paidOrders = orders.filter((order) => isPaid(order.status));
    const recovered = carts.filter((cart) => string(cart.recoveryState) === "recovered" || (string(cart.status) === "converted" && Boolean(cart.abandonedAt)));
    const couponOrders = paidOrders.filter((order) => Boolean(string(order.couponCode)) || number(order.discountTotal) > 0);
    const bpgOrders = paidOrders.filter((order) => Boolean(string(order.bpgCode)) || /^BPG/i.test(string(order.giftCode)));

    const metrics = {
      totalCarts: carts.length,
      abandoned: carts.filter((cart) => string(cart.status) === "abandoned").length,
      eligible: carts.filter((cart) => string(cart.status) === "abandoned" && cart.recoveryEligible === true).length,
      awaitingFirstReminder: carts.filter((cart) => string(cart.recoveryState) === "eligible").length,
      firstReminderSent: carts.filter((cart) => string(cart.recoveryState) === "reminder-1-sent").length,
      secondReminderSent: carts.filter((cart) => string(cart.recoveryState) === "reminder-2-sent").length,
      suppressed: carts.filter((cart) => string(cart.recoveryState) === "suppressed").length,
      recoveredCarts: recovered.length,
      recoveredRevenue: recovered.reduce((sum, cart) => sum + number(cart.recoveredRevenue), 0),
      couponCarts: carts.filter((cart) => Boolean(string(cart.couponCode))).length,
      bpgCarts: carts.filter((cart) => Boolean(string(cart.bpgCode)) || /^BPG/i.test(string(cart.giftCode))).length,
      giftCodeCarts: carts.filter((cart) => Boolean(string(cart.giftCode))).length,
      couponOrders: couponOrders.length,
      couponRevenue: couponOrders.reduce((sum, order) => sum + number(order.total), 0),
      bpgOrders: bpgOrders.length,
      bpgRevenue: bpgOrders.reduce((sum, order) => sum + number(order.total), 0),
      giftsSent: gifts.filter((gift) => string(gift.status) === "sent").length,
      giftsRedeemed: gifts.filter((gift) => string(gift.status) === "redeemed").length
    };

    return NextResponse.json({
      ok: true,
      config: getCartRecoveryConfig(),
      metrics,
      carts: carts.slice(0, 100).map(cartRow)
    });
  } catch (error) {
    console.error("Cart recovery admin dashboard failed", error);
    return NextResponse.json({ error: "Cart recovery dashboard failed." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: ActionBody;
  try {
    body = (await request.json()) as ActionBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = string(body.action);
  const cartId = id(body.cartId);

  try {
    if (action === "sweep") {
      const result = await runCartRecoveryAutomation({ sendReminders: false, source: "cart-recovery-admin-sweep" });
      return NextResponse.json({ ok: true, mode: "email-safe-sweep", result });
    }

    if (action === "dry-run-cart") {
      if (cartId === null) return NextResponse.json({ error: "Choose a cart first." }, { status: 400 });
      const result = await runCartRecoveryAutomation({ forceCartId: cartId, sendReminders: false, source: "cart-recovery-admin-dry-run" });
      return NextResponse.json({ ok: true, mode: "email-safe-cart-test", result });
    }

    if (action === "send-test-reminder") {
      if (cartId === null) return NextResponse.json({ error: "Choose an abandoned consented cart first." }, { status: 400 });
      const reminder = body.reminder === "second" ? "second" : "first";
      const result = await sendManualCartRecoveryReminder(cartId, reminder);
      const status = result.reason === "email-delivery-disabled" ? 409 : 200;
      return NextResponse.json({ ok: result.ok, mode: "manual-reminder", result }, { status });
    }

    return NextResponse.json({ error: "Unknown recovery action." }, { status: 400 });
  } catch (error) {
    console.error("Cart recovery admin action failed", error);
    return NextResponse.json({ error: "Cart recovery action failed." }, { status: 500 });
  }
}
