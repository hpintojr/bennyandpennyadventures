import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { createPasswordToken, passwordSetupUrl } from "@/lib/authTokens";
import { sendPasswordLinkEmail } from "@/lib/email";
import { checkBotProtection } from "@/lib/botProtection";

export const runtime = "nodejs";

type PayloadDoc = { id: string | number; [k: string]: unknown };
type PayloadFindResult = { docs?: PayloadDoc[] };

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function normEmail(v: unknown) {
  const e = typeof v === "string" ? v.trim().toLowerCase() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
}

const GENERIC = { ok: true, message: "If that email can be set up, we've sent a link to continue. Please check your inbox." };

export async function POST(request: Request) {
  let body: { email?: unknown; firstName?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const botResponse = await checkBotProtection({
    body: body as Record<string, unknown>,
    request,
    routeName: "register",
    maxRequests: 3
  });
  if (botResponse) return botResponse;

  const email = normEmail(body.email);
  if (!email) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : undefined;

  try {
    const payload = await getPayloadClient();
    const existing = (await payload.find({ collection: "users", limit: 1, where: { email: { equals: email } } })) as PayloadFindResult;
    let user = existing.docs?.[0];
    let mode: "setup" | "reset" = "setup";

    if (!user) {
      user = (await payload.create({
        collection: "users",
        data: {
          email,
          firstName,
          role: "customer",
          acquiredVia: "organic",
          passwordSetByCustomer: false,
          password: crypto.randomBytes(24).toString("base64url")
        },
        overrideAccess: true
      })) as PayloadDoc;
      mode = "setup";
    } else {
      // Existing account: setup link if never activated, otherwise a reset link to get back in.
      mode = user.passwordSetByCustomer === true ? "reset" : "setup";
    }

    const raw = await createPasswordToken(payload, user.id, email, mode);
    await sendPasswordLinkEmail({ to: email, link: passwordSetupUrl(raw), mode });
  } catch (error) {
    console.error("Register failed", error);
    // Still return generic success to avoid leaking which emails exist.
  }

  return NextResponse.json(GENERIC);
}
