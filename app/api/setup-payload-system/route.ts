import { Client } from "pg";

export const dynamic = "force-dynamic";

function jsonResponse(body: { ok: boolean; message: string; error?: string }, status = 200) {
  return Response.json(body, { status });
}

const systemSql = `
CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
  "id" serial PRIMARY KEY,
  "global_slug" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
  "id" serial PRIMARY KEY,
  "parent_id" integer REFERENCES "payload_locked_documents"("id") ON DELETE CASCADE,
  "path" varchar NOT NULL,
  "users_id" integer,
  "books_id" integer,
  "customer_addresses_id" integer,
  "contact_submissions_id" integer,
  "subscribers_id" integer,
  "orders_id" integer,
  "order_items_id" integer,
  "downloads_id" integer,
  "support_tickets_id" integer,
  "support_messages_id" integer,
  "access_grants_id" integer,
  "audit_logs_id" integer
);

CREATE TABLE IF NOT EXISTS "payload_migrations" (
  "id" serial PRIMARY KEY,
  "name" varchar,
  "batch" numeric,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" ("created_at");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_users_idx" ON "payload_locked_documents_rels" ("users_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_books_idx" ON "payload_locked_documents_rels" ("books_id");
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
    await client.query(systemSql);

    return jsonResponse({
      ok: true,
      message: "Payload internal system tables were created. Refresh the admin collection page."
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: "Payload system table setup failed.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}
