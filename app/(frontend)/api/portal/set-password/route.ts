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
    data: { password, passwordSetByCustomer: true }
  });

  return NextResponse.json({ ok: true, email });
}
