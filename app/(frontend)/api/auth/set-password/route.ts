import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { consumePasswordToken } from "@/lib/authTokens";
import { checkBotProtection } from "@/lib/botProtection";

export const runtime = "nodejs";

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

export async function POST(request: Request) {
  let body: { token?: unknown; password?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const botResponse = await checkBotProtection({
    body: body as Record<string, unknown>,
    request,
    routeName: "set-password",
    maxRequests: 5
  });
  if (botResponse) return botResponse;

  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  if (password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  try {
    const payload = await getPayloadClient();
    const consumed = await consumePasswordToken(payload, token);
    if (!consumed) {
      return NextResponse.json({ error: "This link is invalid or has expired. Please request a new one." }, { status: 400 });
    }

    await payload.update({
      collection: "users",
      id: consumed.userId,
      data: { password, passwordSetByCustomer: true },
      overrideAccess: true
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Set-password (token) failed", error);
    return NextResponse.json({ error: "We could not set your password right now. Please try again." }, { status: 500 });
  }
}
