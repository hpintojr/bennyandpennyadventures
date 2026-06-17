import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { submitPrintJobToLulu } from "@/lib/luluApi";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PayloadUser = {
  id?: string | number;
  role?: string;
};

function setupSecretName() {
  return ["PAYLOAD", "SETUP", "SECRET"].join("_");
}

async function isAuthorized(request: Request, payload: Awaited<ReturnType<typeof getPayload>>) {
  const secret = process.env[setupSecretName()];
  if (secret && request.headers.get("x-setup-secret") === secret) return true;

  try {
    const auth = await payload.auth({ headers: request.headers });
    const user = auth.user as PayloadUser | null | undefined;
    return user?.role === "admin";
  } catch {
    return false;
  }
}

export async function POST(request: Request, context: RouteContext) {
  const payload = await getPayload({ config });

  if (!(await isAuthorized(request, payload))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing print job id" }, { status: 400 });
  }

  try {
    const result = await submitPrintJobToLulu(payload as never, id);
    return NextResponse.json({ ok: true, printJobId: id, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "LuLu submit failed";
    return NextResponse.json({ ok: false, printJobId: id, error: message }, { status: 400 });
  }
}
