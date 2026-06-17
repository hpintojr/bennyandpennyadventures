import { NextResponse } from "next/server";
import { getPortalAuth, str, relId, type PayloadFindResult } from "@/lib/portalData";

export const runtime = "nodejs";

const CATEGORIES = ["order", "download", "audiobook", "print-shipping", "bulk-order", "institutional", "general"];

export async function GET() {
  const { payload, user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawEmail = str(user.email) || "";
  const tickets = (await payload.find({
    collection: "support-tickets",
    depth: 0,
    limit: 100,
    sort: "-createdAt",
    where: {
      or: [
        { customer: { equals: user.id } },
        ...(rawEmail ? [{ customerEmail: { equals: rawEmail } }, { customerEmail: { like: rawEmail } }] : [])
      ]
    }
  })) as PayloadFindResult;

  return NextResponse.json({
    tickets: (tickets.docs || []).map((t) => ({
      id: t.id,
      subject: str(t.subject),
      category: str(t.category),
      status: str(t.status) || "open",
      priority: str(t.priority) || "normal",
      message: str(t.message),
      relatedOrder: relId(t.relatedOrder),
      createdAt: str(t.createdAt)
    }))
  });
}

export async function POST(request: Request) {
  const { payload, user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { subject?: unknown; category?: unknown; message?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const category = typeof body.category === "string" && CATEGORIES.includes(body.category) ? body.category : "general";

  if (subject.length < 3) return NextResponse.json({ error: "Please add a short subject." }, { status: 400 });
  if (message.length < 10) return NextResponse.json({ error: "Please describe your question in a little more detail." }, { status: 400 });

  try {
    const ticket = await payload.create({
      collection: "support-tickets",
      data: {
        customer: user.id,
        customerEmail: str(user.email),
        subject,
        category,
        message,
        status: "open",
        priority: "normal"
      }
    });
    return NextResponse.json({ ok: true, id: (ticket as { id: string | number }).id }, { status: 201 });
  } catch (error) {
    console.error("Support ticket create failed", error);
    return NextResponse.json({ error: "Could not submit your request. Please try again." }, { status: 500 });
  }
}
