import { Client } from "pg";

export const dynamic = "force-dynamic";

type SetupResult = {
  ok: boolean;
  message: string;
  error?: string;
};

function jsonResponse(body: SetupResult, status = 200) {
  return Response.json(body, { status });
}

const setupSql = `
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "first_name" varchar,
  "last_name" varchar,
  "role" varchar DEFAULT 'customer' NOT NULL,
  "phone" varchar,
  "sms_marketing_opt_in" boolean DEFAULT false,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "email" varchar NOT NULL UNIQUE,
  "reset_password_token" varchar,
  "reset_password_expiration" timestamp(3) with time zone,
  "salt" varchar,
  "hash" varchar,
  "login_attempts" numeric DEFAULT 0,
  "lock_until" timestamp(3) with time zone
);

CREATE TABLE IF NOT EXISTS "users_sessions" (
  "id" varchar PRIMARY KEY,
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL
);

CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" ("_order");
CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions" ("_parent_id");
`;

const repairSessionsIdSql = [
  'ALTER TABLE "users_sessions" ALTER COLUMN "id" DROP DEFAULT',
  'ALTER TABLE "users_sessions" ALTER COLUMN "id" TYPE varchar USING "id"::varchar'
].join('; ');

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.PAYLOAD_SETUP_SECRET;
  const databaseUri = process.env.DATABASE_URI;

  if (!expectedSecret) {
    return jsonResponse({ ok: false, message: "PAYLOAD_SETUP_SECRET is not configured in Vercel." }, 500);
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, message: "Unauthorized setup request." }, 401);
  }

  if (!databaseUri) {
    return jsonResponse({ ok: false, message: "DATABASE_URI is not configured in Vercel." }, 500);
  }

  const client = new Client({ connectionString: databaseUri });

  try {
    await client.connect();
    await client.query(setupSql);
    await client.query(repairSessionsIdSql);

    return jsonResponse({
      ok: true,
      message: "Core Payload users schema was repaired. Visit /admin and create or log in as the admin user."
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: "Payload database schema setup failed. Check Vercel runtime logs for the full error.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}
