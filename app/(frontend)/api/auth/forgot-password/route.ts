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

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const botResponse = await checkBotProtection({
    body: body as Record<string, unknown>,
    request,
    routeName: "forgot-password",
    maxRequests: 3
  });
  if (botResponse) return botResponse;

  const email = normEmail(body.email);
  if (!email) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  try {
    const payload = await getPayloadClient();
    const found = (await payload.find({ collection: "users", limit: 1, where: { email: { equals: email } } })) as PayloadFindResult;
    const user = found.docs?.[0];
    if (user) {
      const mode = user.passwordSetByCustomer === true ? "reset" : "setup";
      const raw = await createPasswordToken(payload, user.id, email, mode);
      await sendPasswordLinkEmail({ to: email, link: passwordSetupUrl(raw), mode });
    }
  } catch (error) {
    console.error("Forgot-password failed", error);
  }

  // Always generic to avoid email enumeration.
  return NextResponse.json({ ok: true, message: "If an account exists for that email, we've sent a reset link." });
}
