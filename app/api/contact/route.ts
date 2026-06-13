import { NextResponse } from "next/server";

const contactEmail = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";
const fromEmail = process.env.CONTACT_FROM_EMAIL || contactEmail;
const fromName = process.env.CONTACT_FROM_NAME || "Benny & Penny's Adventures";
const mailjetApiKey = process.env.MAILJET_API_KEY;
const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendContactNotification({
  name,
  email,
  inquiryType,
  message
}: {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}) {
  if (!mailjetApiKey || !mailjetSecretKey) {
    throw new Error("Mailjet is not configured. Add MAILJET_API_KEY and MAILJET_SECRET_KEY in Vercel.");
  }

  const auth = Buffer.from(`${mailjetApiKey}:${mailjetSecretKey}`).toString("base64");
  const submittedAt = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const textBody = [
    "New Benny & Penny contact form submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Inquiry Type: ${inquiryType}`,
    `Submitted: ${submittedAt} PT`,
    "",
    "Message:",
    message
  ].join("\n");

  const htmlBody = `
    <h2>New Benny &amp; Penny contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Inquiry Type:</strong> ${escapeHtml(inquiryType)}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)} PT</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName
          },
          To: [
            {
              Email: contactEmail,
              Name: "Benny & Penny Contact"
            }
          ],
          ReplyTo: {
            Email: email,
            Name: name
          },
          Subject: `New website inquiry: ${inquiryType}`,
          TextPart: textBody,
          HTMLPart: htmlBody
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Mailjet contact notification failed", errorText);
    throw new Error("Unable to send your message right now. Please try again soon.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const inquiryType = String(body.inquiryType || "General question").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Please complete your name, email, and message." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    // TODO: When Payload CMS is connected, save this submission to the ContactSubmissions collection.
    await sendContactNotification({ name, email, inquiryType, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send your message right now. Please try again soon." }, { status: 500 });
  }
}
