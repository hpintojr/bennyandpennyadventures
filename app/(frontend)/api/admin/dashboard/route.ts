import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { getDashboardAnalytics } from "@/lib/dashboardAnalytics";
import { isDashboardRange } from "@/lib/dashboardRanges";

export const runtime = "nodejs";

type PayloadUser = { id?: string | number; role?: unknown };

async function requireAdmin() {
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: await getHeaders() });
  const user = auth.user as PayloadUser | null | undefined;
  return Boolean(user?.id && user.role === "admin");
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rangeParam = new URL(request.url).searchParams.get("range");
  const range = isDashboardRange(rangeParam) ? rangeParam : "Today";

  try {
    const data = await getDashboardAnalytics(range);
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin dashboard range refresh failed", { range, error });
    return NextResponse.json({ error: "Dashboard refresh failed." }, { status: 500 });
  }
}
