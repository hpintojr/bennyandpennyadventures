import { NextResponse } from "next/server";

const contactEmail = process.env.CONTACT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    // TODO: When Mailjet/Resend is connected, send a notification email to contactEmail.
    console.log("New Benny & Penny contact submission", {
      name,
      email,
      inquiryType,
      message,
      notify: contactEmail,
      submittedAt: new Date().toISOString()
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form submission failed", error);
    return NextResponse.json({ error: "Unable to send your message right now. Please try again soon." }, { status: 500 });
  }
}
