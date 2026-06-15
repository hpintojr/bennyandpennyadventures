import { NextResponse } from "next/server";
import { fulfillCheckoutSessionById } from "@/lib/stripeFulfillment";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const expected = process.env.PAYLOAD_SETUP_SECRET;
  if (!expected) return false;

  const url = new URL(request.url);
  const provided = request.headers.get("x-setup-secret") || url.searchParams.get("secret");
  return provided === expected;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown reconciliation error.";
}

function getPayloadErrors(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== "object") return undefined;
  const errors = (data as { errors?: unknown }).errors;
  return Array.isArray(errors) ? errors : undefined;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "A valid Stripe Checkout session_id is required." }, { status: 400 });
  }

  try {
    const summary = await fulfillCheckoutSessionById(sessionId);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("Manual Stripe order reconciliation failed", error);
    return NextResponse.json(
      {
        error: "Manual Stripe order reconciliation failed.",
        detail: getErrorMessage(error),
        payloadErrors: getPayloadErrors(error)
      },
      { status: 500 }
    );
  }
}
