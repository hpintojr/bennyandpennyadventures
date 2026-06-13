import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isMissingTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("relation \"subscribers\" does not exist") || message.includes("42P01");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const source = String(body.source || "website").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    try {
      const payload = await getPayload({ config });
      const existing = await payload.find({
        collection: "subscribers",
        where: { email: { equals: email } },
        limit: 1,
        depth: 0
      });

      if (existing.docs[0]) {
        await payload.update({
          collection: "subscribers",
          id: existing.docs[0].id,
          data: {
            source,
            marketingOptIn: true,
            productUpdatesOptIn: true,
            freePrintablesOptIn: true,
            unsubscribedAt: null
          }
        });
      } else {
        await payload.create({
          collection: "subscribers",
          data: {
            email,
            source,
            marketingOptIn: true,
            productUpdatesOptIn: true,
            freePrintablesOptIn: true
          }
        });
      }
    } catch (payloadError) {
      if (!isMissingTableError(payloadError)) {
        throw payloadError;
      }

      console.error("Newsletter signup accepted, but the subscribers table is missing. Run Payload schema setup before relying on stored signups.", payloadError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ error: "Unable to save your signup right now. Please try again soon." }, { status: 500 });
  }
}
