import config from "@payload-config";
import Mailjet from "node-mailjet";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

const contactEmail = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";
const fromEmail = process.env.CONTACT_FROM_EMAIL || contactEmail;
const fromName = process.env.CONTACT_FROM_NAME || "Benny & Penny's Adventures";
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;

const validRequestTypes = new Set([
  "access",
  "delete",
  "correct",
  "do-not-sell-share",
  "limit-sensitive",
  "unsubscribe-email",
  "opt-out-sms",
  "other"
]);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getBoolean(value: unknown) {
  return value === true || value === "true";
}

function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "";
  return request.headers.get("x-real-ip") || "";
}

function isMissingPrivacySchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("privacy_requests") || message.includes("consent_logs") || message.includes("42P01") || message.includes("42703");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getMailjetClient() {
  if (!mailjetApiKey || !mailjetSecretKey) {
    throw new Error("Mailjet is not configured yet.");
  }

  return Mailjet.apiConnect(mailjetApiKey, mailjetSecretKey);
}

async function sendPrivacyRequestNotification({
  requestType,
  state,
  name,
  email,
  phone,
  message,
  submittedAt,
  ipAddress
}: {
  requestType: string;
  state: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  submittedAt: string;
  ipAddress: string;
}) {
  const submittedAtPt = new Date(submittedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const textBody = [
    "New privacy request",
    "",
    `Request Type: ${requestType}`,
    `State: ${state}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Submitted: ${submittedAtPt} PT`,
    `IP: ${ipAddress || "Unavailable"}`,
    "",
    "Message:",
    message
  ].join("\n");

  const htmlBody = `
    <h2>New privacy request</h2>
    <p><strong>Request Type:</strong> ${escapeHtml(requestType)}</p>
    <p><strong>State:</strong> ${escapeHtml(state)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAtPt)} PT</p>
    <p><strong>IP:</strong> ${escapeHtml(ipAddress || "Unavailable")}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  await getMailjetClient().post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: fromName
        },
        To: [
          {
            Email: contactEmail,
            Name: "Benny & Penny Privacy"
          }
        ],
        ReplyTo: {
          Email: email,
          Name: name
        },
        Subject: `Privacy request: ${requestType}`,
        TextPart: textBody,
        HTMLPart: htmlBody
      }
    ]
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requestType = String(body.requestType || "").trim();
    const state = String(body.state || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const message = String(body.message || "").trim();
    const contactConsent = getBoolean(body.contactConsent);
    const submittedAt = new Date().toISOString();
    const requestIpAddress = getRequestIp(request);
    const requestUserAgent = request.headers.get("user-agent") || "";

    if (!validRequestTypes.has(requestType)) {
      return NextResponse.json({ error: "Please select a valid request type." }, { status: 400 });
    }

    if (!state || !name || !email || !message) {
      return NextResponse.json({ error: "Please complete your state, name, email, and request details." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!contactConsent) {
      return NextResponse.json({ error: "Please accept the privacy request contact disclosure before submitting." }, { status: 400 });
    }

    try {
      const payload = await getPayload({ config });
      const created = await payload.create({
        collection: "privacy-requests" as never,
        data: {
          requestType,
          state,
          name,
          email,
          phone: phone || undefined,
          message,
          contactConsent,
          submittedAt,
          requestIpAddress: requestIpAddress || undefined,
          requestUserAgent: requestUserAgent || undefined,
          status: "new",
          verificationStatus: "not-started"
        } as never
      });

      try {
        await payload.create({
          collection: "consent-logs" as never,
          data: {
            source: "privacy-request",
            consentType: "privacy-request",
            name,
            email,
            phone: phone || undefined,
            optIn: true,
            consentText: "User submitted a privacy request and agreed to be contacted for verification and processing.",
            sourcePath: "/privacy/requests",
            ipAddress: requestIpAddress || undefined,
            userAgent: requestUserAgent || undefined,
            relatedCollection: "privacy-requests",
            relatedId: String((created as { id?: string | number }).id || ""),
            metadata: { requestType, state }
          } as never
        });
      } catch (consentError) {
        console.error("Privacy request accepted, but consent log creation failed", consentError);
      }
    } catch (payloadError) {
      if (!isMissingPrivacySchemaError(payloadError)) {
        throw payloadError;
      }

      console.error("Privacy request accepted, but privacy request/consent log tables need schema setup.", payloadError);
    }

    try {
      await sendPrivacyRequestNotification({ requestType, state, name, email, phone, message, submittedAt, ipAddress: requestIpAddress });
    } catch (emailError) {
      console.error("Privacy request was accepted, but email notification failed", emailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Privacy request submission failed", error);
    return NextResponse.json({ error: "Unable to submit your privacy request right now. Please try again soon." }, { status: 500 });
  }
}
