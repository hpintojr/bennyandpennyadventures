import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = { docs?: PayloadDoc[] };

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function normalizeEmail(value: unknown): string | null {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

// Status check used by the thank-you card: does this paid order already have an
// activated account? Lets us show existing members a "sign in" prompt instead of
// the create-password form. Never returns the email.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = (searchParams.get("session_id") || "").trim();
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ accountExists: false, passwordSet: false });
  }
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ accountExists: false, passwordSet: false });
    }
    const email = normalizeEmail(session.customer_details?.email) || normalizeEmail(session.customer_email);
    if (!email) return NextResponse.json({ accountExists: false, passwordSet: false });

    const payload = await getPayloadClient();
    const found = (await payload.find({
      collection: "users",
      limit: 1,
      where: { email: { equals: email } }
    })) as PayloadFindResult;
    const user = found.docs?.[0];

    // Treat as a returning member (show "sign in" instead of the create-password form)
    // if they have set a password before OR they have more than one order — a brand-new
    // buyer has exactly one order from this checkout.
    let priorOrders = 0;
    if (user) {
      const ordersRes = (await payload.find({
        collection: "orders",
        limit: 2,
        where: { customer: { equals: user.id } }
      })) as PayloadFindResult & { totalDocs?: number };
      priorOrders = typeof ordersRes.totalDocs === "number" ? ordersRes.totalDocs : (ordersRes.docs?.length ?? 0);
    }

    const returning = Boolean(user) && (user?.passwordSetByCustomer === true || priorOrders >= 2);
    return NextResponse.json({ accountExists: Boolean(user), passwordSet: returning });
  } catch {
    return NextResponse.json({ accountExists: false, passwordSet: false });
  }
}

export async function POST(request: Request) {
  let body: { sessionId?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { sessionId?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "A valid checkout session is required." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  // The Stripe session id acts as a one-time capability proof that this person
  // completed this checkout. We confirm it is paid and read the buyer's email
  // from Stripe — the client never gets to choose which account to modify.
  let email: string | null = null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "This order is not confirmed yet. Please try again shortly." }, { status: 409 });
    }
    email = normalizeEmail(session.customer_details?.email) || normalizeEmail(session.customer_email);
  } catch {
    return NextResponse.json({ error: "We could not verify your order. Please try again." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "No email is associated with this order yet." }, { status: 404 });
  }

  try {
    const payload = await getPayloadClient();
    const found = (await payload.find({
      collection: "users",
      limit: 1,
      where: { email: { equals: email } }
    })) as PayloadFindResult;

    const user = found.docs?.[0];
    if (!user) {
      return NextResponse.json({ error: "Your account is still being created. Please try again in a moment." }, { status: 404 });
    }

    if (user.passwordSetByCustomer === true) {
      return NextResponse.json(
        { error: "This account already has a password. Please sign in instead.", alreadySet: true },
        { status: 409 }
      );
    }

    await payload.update({
      collection: "users",
      id: user.id,
      data: { password, passwordSetByCustomer: true },
      overrideAccess: true
    });

    return NextResponse.json({ ok: true, email });
  } catch (error) {
    console.error("Set-password failed", error);
    return NextResponse.json(
      { error: "We could not set your password right now. Please try again, or sign in if you already have an account." },
      { status: 500 }
    );
  }
}
