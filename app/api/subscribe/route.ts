import { NextResponse } from "next/server";
import { getPayload } from "payload";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isMissingTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("relation \"subscribers\" does not exist") || message.includes("relation \"consent_logs\" does not exist") || message.includes("42P01") || message.includes("42703");
}

function getBoolean(value: unknown) {
  return value === true || value === "true";
}

function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip") || "";
}

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const source = String(body.source || "website").trim();
    const emailOptIn = getBoolean(body.emailOptIn);
    const emailConsentText = String(body.emailConsentText || "I agree to receive occasional email updates from Benny & Penny's Adventures. I can unsubscribe at any time.").trim();
    const ipAddress = getRequestIp(request);
    const userAgent = request.headers.get("user-agent") || "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!emailOptIn) {
      return NextResponse.json({ error: "Please accept the email opt-in disclosure before signing up." }, { status: 400 });
    }

    try {
      const payload = await getPayloadClient();
      const existing = await payload.find({
        collection: "subscribers",
        where: { email: { equals: email } },
        limit: 1,
        depth: 0
      });

      let subscriberId = "";

      if (existing.docs[0]) {
        const updated = await payload.update({
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
        subscriberId = String((updated as { id?: string | number }).id || existing.docs[0].id || "");
      } else {
        const created = await payload.create({
          collection: "subscribers",
          data: {
            email,
            source,
            marketingOptIn: true,
            productUpdatesOptIn: true,
            freePrintablesOptIn: true
          }
        });
        subscriberId = String((created as { id?: string | number }).id || "");
      }

      try {
        await payload.create({
          collection: "consent-logs" as never,
          data: {
            source: "newsletter",
            consentType: "email-marketing",
            email,
            optIn: true,
            consentText: emailConsentText,
            sourcePath: source,
            ipAddress: ipAddress || undefined,
            userAgent: userAgent || undefined,
            relatedCollection: "subscribers",
            relatedId: subscriberId,
            metadata: { source }
          } as never
        });
      } catch (consentError) {
        console.error("Newsletter signup accepted, but consent log creation failed", consentError);
      }
    } catch (payloadError) {
      if (!isMissingTableError(payloadError)) {
        throw payloadError;
      }

      console.error("Newsletter signup accepted, but the subscribers or consent_logs table is missing. Run Payload schema setup before relying on stored signups.", payloadError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Newsletter signup failed", error);
    return NextResponse.json({ error: "Unable to save your signup right now. Please try again soon." }, { status: 500 });
  }
}
