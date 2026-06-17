import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { submitPrintJobToLulu } from "@/lib/luluApi";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function setupSecretName() {
  return ["PAYLOAD", "SETUP", "SECRET"].join("_");
}

function isAuthorized(request: Request) {
  const secret = process.env[setupSecretName()];
  if (!secret) return false;
  return request.headers.get("x-setup-secret") === secret;
}

export async function POST(request: Request, context: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing print job id" }, { status: 400 });
  }

  const payload = await getPayload({ config });

  try {
    const result = await submitPrintJobToLulu(payload as never, id);
    return NextResponse.json({ ok: true, printJobId: id, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LuLu submit failed";
    return NextResponse.json({ ok: false, printJobId: id, error: message }, { status: 400 });
  }
}
