import { Client } from "pg";

export const dynamic = "force-dynamic";

function jsonResponse(body: { ok: boolean; message: string; error?: string }, status = 200) {
  return Response.json(body, { status });
}

const preferencesSql = `
CREATE TABLE IF NOT EXISTS "payload_preferences" (
  "id" serial PRIMARY KEY,
  "key" varchar,
  "value" jsonb,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
  "id" serial PRIMARY KEY,
  "parent_id" integer REFERENCES "payload_preferences"("id") ON DELETE CASCADE,
  "path" varchar NOT NULL,
  "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" ("key");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_users_idx" ON "payload_preferences_rels" ("users_id");
`;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.PAYLOAD_SETUP_SECRET;
  const databaseUri = process.env.DATABASE_URI;

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, message: "Unauthorized setup request." }, 401);
  }

  if (!databaseUri) {
    return jsonResponse({ ok: false, message: "DATABASE_URI is not configured in Vercel." }, 500);
  }

  const client = new Client({ connectionString: databaseUri });

  try {
    await client.connect();
    await client.query(preferencesSql);

    return jsonResponse({
      ok: true,
      message: "Payload preference tables were created. Refresh /admin and log in."
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: "Payload preference setup failed.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}
