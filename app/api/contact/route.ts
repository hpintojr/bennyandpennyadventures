import Mailjet from "node-mailjet";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { checkBotProtection, getRequestIp } from "@/lib/botProtection";

const contactEmail = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";
const fromEmail = process.env.CONTACT_FROM_EMAIL || contactEmail;
const fromName = process.env.CONTACT_FROM_NAME || "Benny & Penny's Adventures";
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isMissingTableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("relation \"contact_submissions\" does not exist") || message.includes("42P01");
}

function isContactSchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return isMissingTableError(error) || message.includes("column") || message.includes("42703");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBoolean(value: unknown) {
  return value === true || value === "true";
}

function getMailjetClient() {
  if (!mailjetApiKey || !mailjetSecretKey) {
    throw new Error("Mailjet is not configured yet.");
  }

  return Mailjet.apiConnect(mailjetApiKey, mailjetSecretKey);
}

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

async function saveContactSubmission({ name, email, phone, inquiryType, message, contactConsent, emailOptIn, smsOptIn, smsConsentText, consentTimestamp, consentIpAddress, consentUserAgent }: { name: string; email: string; phone: string; inquiryType: string; message: string; contactConsent: boolean; emailOptIn: boolean; smsOptIn: boolean; smsConsentText: string; consentTimestamp: string; consentIpAddress: string; consentUserAgent: string; }) {
  const payload = await getPayloadClient();
  const created = await payload.create({ collection: "contact-submissions", data: { name, email, phone: phone || undefined, inquiryType, message, contactConsent, emailOptIn, smsOptIn, smsConsentText: smsConsentText || undefined, consentTimestamp, consentIpAddress: consentIpAddress || undefined, consentUserAgent: consentUserAgent || undefined, status: "new" } });
  const relatedId = String((created as { id?: string | number }).id || "");
  const consentEvents = [
    { consentType: "contact-consent", optIn: contactConsent, consentText: "User agreed that Benny & Penny's Adventures may contact them about this inquiry using the information provided." },
    emailOptIn ? { consentType: "email-marketing", optIn: true, consentText: "User agreed to receive occasional email updates about books, resources, releases, and family support content." } : null,
    smsOptIn ? { consentType: "sms", optIn: true, consentText: smsConsentText } : null
  ].filter(Boolean) as { consentType: string; optIn: boolean; consentText: string }[];
  for (const event of consentEvents) {
    try {
      await payload.create({ collection: "consent-logs" as never, data: { source: "contact-form", consentType: event.consentType, name, email, phone: phone || undefined, optIn: event.optIn, consentText: event.consentText, sourcePath: "/contact", ipAddress: consentIpAddress || undefined, userAgent: consentUserAgent || undefined, relatedCollection: "contact-submissions", relatedId, metadata: { inquiryType } } as never });
    } catch (consentLogError) {
      console.error("Contact submission accepted, but consent log creation failed", consentLogError);
    }
  }
}

async function sendContactNotification({ name, email, phone, inquiryType, message, contactConsent, emailOptIn, smsOptIn, smsConsentText, consentTimestamp, consentIpAddress }: { name: string; email: string; phone: string; inquiryType: string; message: string; contactConsent: boolean; emailOptIn: boolean; smsOptIn: boolean; smsConsentText: string; consentTimestamp: string; consentIpAddress: string; }) {
  const submittedAt = new Date(consentTimestamp).toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  const textBody = ["New Benny & Penny contact form submission", "", `Name: ${name}`, `Email: ${email}`, `Phone: ${phone || "Not provided"}`, `Inquiry Type: ${inquiryType}`, `Submitted: ${submittedAt} PT`, "", "Consent:", `Contact consent: ${contactConsent ? "Yes" : "No"}`, `Email opt-in: ${emailOptIn ? "Yes" : "No"}`, `SMS opt-in: ${smsOptIn ? "Yes" : "No"}`, `Consent IP: ${consentIpAddress || "Unavailable"}`, smsOptIn && smsConsentText ? `SMS disclosure accepted: ${smsConsentText}` : "", "", "Message:", message].filter(Boolean).join("\n");
  const htmlBody = `<h2>New Benny &amp; Penny contact form submission</h2><p><strong>Name:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p><p><strong>Inquiry Type:</strong> ${escapeHtml(inquiryType)}</p><p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} PT</p><hr /><p><strong>Consent:</strong></p><ul><li>Contact consent: ${contactConsent ? "Yes" : "No"}</li><li>Email opt-in: ${emailOptIn ? "Yes" : "No"}</li><li>SMS opt-in: ${smsOptIn ? "Yes" : "No"}</li><li>Consent IP: ${escapeHtml(consentIpAddress || "Unavailable")}</li></ul>${smsOptIn && smsConsentText ? `<p><strong>SMS disclosure accepted:</strong><br />${escapeHtml(smsConsentText)}</p>` : ""}<hr /><p><strong>Message:</strong></p><p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>`;
  const result = await getMailjetClient().post("send", { version: "v3.1" }).request({ Messages: [{ From: { Email: fromEmail, Name: fromName }, To: [{ Email: contactEmail, Name: "Benny & Penny Contact" }], ReplyTo: { Email: email, Name: name }, Subject: `New website inquiry: ${inquiryType}`, TextPart: textBody, HTMLPart: htmlBody }] });
  console.log("Mailjet contact notification sent", { status: result.response.status, fromEmail, contactEmail });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const botResponse = await checkBotProtection({ body, request, routeName: "contact", maxRequests: 5 });
    if (botResponse) return botResponse;
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const inquiryType = String(body.inquiryType || "General question").trim();
    const message = String(body.message || "").trim();
    const contactConsent = getBoolean(body.contactConsent);
    const emailOptIn = getBoolean(body.emailOptIn);
    const smsOptIn = getBoolean(body.smsOptIn);
    const smsConsentText = String(body.smsConsentText || "").trim();
    const consentTimestamp = new Date().toISOString();
    const consentIpAddress = getRequestIp(request);
    const consentUserAgent = request.headers.get("user-agent") || "";
    if (!name || !email || !message) return NextResponse.json({ error: "Please complete your name, email, and message." }, { status: 400 });
    if (!isValidEmail(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!contactConsent) return NextResponse.json({ error: "Please accept the contact consent disclosure before sending your message." }, { status: 400 });
    if (smsOptIn && !phone) return NextResponse.json({ error: "Please provide a phone number before opting in to SMS messages." }, { status: 400 });
    try {
      await saveContactSubmission({ name, email, phone, inquiryType, message, contactConsent, emailOptIn, smsOptIn, smsConsentText, consentTimestamp, consentIpAddress, consentUserAgent });
    } catch (payloadError) {
      if (!isContactSchemaError(payloadError)) throw payloadError;
      console.error("Contact form accepted, but the contact_submissions table needs the opt-in consent schema patch before relying on stored submissions.", payloadError);
    }
    try {
      await sendContactNotification({ name, email, phone, inquiryType, message, contactConsent, emailOptIn, smsOptIn, smsConsentText, consentTimestamp, consentIpAddress });
    } catch (emailError) {
      console.error("Contact submission was accepted, but email notification failed", emailError);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send your message right now. Please try again soon." }, { status: 500 });
  }
}
