import { NextResponse } from "next/server";
import { getPortalAuth, str } from "@/lib/portalData";

export const runtime = "nodejs";

export async function GET() {
  const { user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    profile: {
      firstName: str(user.firstName) || "",
      lastName: str(user.lastName) || "",
      email: str(user.email) || "",
      phone: str(user.phone) || "",
      smsMarketingOptIn: Boolean(user.smsMarketingOptIn),
      passwordSetByCustomer: Boolean(user.passwordSetByCustomer)
    }
  });
}

export async function PATCH(request: Request) {
  const { payload, user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { firstName?: unknown; lastName?: unknown; phone?: unknown; smsMarketingOptIn?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.firstName === "string") data.firstName = body.firstName.trim();
  if (typeof body.lastName === "string") data.lastName = body.lastName.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim();
  if (typeof body.smsMarketingOptIn === "boolean") data.smsMarketingOptIn = body.smsMarketingOptIn;

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  try {
    await payload.update({ collection: "users", id: user.id, data });
  } catch (error) {
    console.error("Account update failed", error);
    return NextResponse.json({ error: "Could not save your changes." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
