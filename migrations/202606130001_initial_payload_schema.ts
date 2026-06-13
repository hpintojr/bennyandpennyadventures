import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
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
      "id" serial PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp(3) with time zone,
      "expires_at" timestamp(3) with time zone NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");
    CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions" ("_order");
    CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions" ("_parent_id");

    CREATE TABLE IF NOT EXISTS "books" (
      "id" serial PRIMARY KEY,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL UNIQUE,
      "number" numeric NOT NULL,
      "topic" varchar,
      "ages" varchar,
      "pages" numeric,
      "status" varchar DEFAULT 'draft' NOT NULL,
      "short_description" varchar,
      "long_description" varchar,
      "cover_image_path" varchar,
      "price_digital" numeric DEFAULT 15.99,
      "price_audiobook" numeric DEFAULT 21.99,
      "price_paperback" numeric DEFAULT 17.99,
      "price_hardcover" numeric DEFAULT 24.99,
      "pdf_object_key" varchar,
      "epub_object_key" varchar,
      "audiobook_object_key" varchar,
      "stripe_digital_price_id" varchar,
      "stripe_audiobook_price_id" varchar,
      "stripe_paperback_price_id" varchar,
      "stripe_hardcover_price_id" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "customer_addresses" (
      "id" serial PRIMARY KEY,
      "customer_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "full_name" varchar NOT NULL,
      "company" varchar,
      "street1" varchar NOT NULL,
      "street2" varchar,
      "city" varchar NOT NULL,
      "state" varchar NOT NULL,
      "postal_code" varchar NOT NULL,
      "country" varchar DEFAULT 'US' NOT NULL,
      "phone" varchar,
      "is_default_shipping" boolean DEFAULT false,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "contact_submissions" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "inquiry_type" varchar NOT NULL,
      "message" varchar NOT NULL,
      "status" varchar DEFAULT 'new' NOT NULL,
      "admin_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "subscribers" (
      "id" serial PRIMARY KEY,
      "email" varchar NOT NULL UNIQUE,
      "first_name" varchar,
      "last_name" varchar,
      "source" varchar,
      "marketing_opt_in" boolean DEFAULT true,
      "product_updates_opt_in" boolean DEFAULT true,
      "free_printables_opt_in" boolean DEFAULT true,
      "unsubscribed_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "subscribers_topics" (
      "id" serial PRIMARY KEY,
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "subscribers"("id") ON DELETE CASCADE,
      "value" varchar
    );

    CREATE TABLE IF NOT EXISTS "orders" (
      "id" serial PRIMARY KEY,
      "order_number" varchar NOT NULL UNIQUE,
      "customer_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "customer_email" varchar NOT NULL,
      "status" varchar DEFAULT 'pending' NOT NULL,
      "stripe_checkout_session_id" varchar,
      "stripe_payment_intent_id" varchar,
      "total" numeric DEFAULT 0 NOT NULL,
      "currency" varchar DEFAULT 'usd' NOT NULL,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "order_items" (
      "id" serial PRIMARY KEY,
      "order_id" integer REFERENCES "orders"("id") ON DELETE SET NULL,
      "book_id" integer REFERENCES "books"("id") ON DELETE SET NULL,
      "title" varchar NOT NULL,
      "format" varchar NOT NULL,
      "quantity" numeric DEFAULT 1 NOT NULL,
      "unit_price" numeric NOT NULL,
      "stripe_price_id" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "downloads" (
      "id" serial PRIMARY KEY,
      "customer_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "order_id" integer REFERENCES "orders"("id") ON DELETE SET NULL,
      "book_id" integer REFERENCES "books"("id") ON DELETE SET NULL,
      "file_label" varchar NOT NULL,
      "format" varchar NOT NULL,
      "r2_object_key" varchar NOT NULL,
      "max_downloads" numeric DEFAULT 3 NOT NULL,
      "downloads_used" numeric DEFAULT 0 NOT NULL,
      "access_expires_at" timestamp(3) with time zone,
      "last_downloaded_at" timestamp(3) with time zone,
      "is_active" boolean DEFAULT true,
      "admin_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "support_tickets" (
      "id" serial PRIMARY KEY,
      "customer_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "customer_email" varchar NOT NULL,
      "related_order_id" integer REFERENCES "orders"("id") ON DELETE SET NULL,
      "subject" varchar NOT NULL,
      "category" varchar DEFAULT 'general' NOT NULL,
      "status" varchar DEFAULT 'open' NOT NULL,
      "priority" varchar DEFAULT 'normal',
      "message" varchar NOT NULL,
      "admin_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "support_messages" (
      "id" serial PRIMARY KEY,
      "ticket_id" integer REFERENCES "support_tickets"("id") ON DELETE SET NULL,
      "sender_type" varchar NOT NULL,
      "sender_email" varchar,
      "message" varchar NOT NULL,
      "message_preview" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "access_grants" (
      "id" serial PRIMARY KEY,
      "customer_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "book_id" integer REFERENCES "books"("id") ON DELETE SET NULL,
      "format" varchar NOT NULL,
      "max_downloads" numeric DEFAULT 3,
      "expires_at" timestamp(3) with time zone,
      "reason" varchar NOT NULL,
      "admin_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" serial PRIMARY KEY,
      "action" varchar NOT NULL,
      "collection_name" varchar,
      "record_id" varchar,
      "admin_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

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
      "users_id" integer REFERENCES "users"("id") ON DELETE CASCADE,
      "books_id" integer REFERENCES "books"("id") ON DELETE CASCADE,
      "customer_addresses_id" integer REFERENCES "customer_addresses"("id") ON DELETE CASCADE,
      "contact_submissions_id" integer REFERENCES "contact_submissions"("id") ON DELETE CASCADE,
      "subscribers_id" integer REFERENCES "subscribers"("id") ON DELETE CASCADE,
      "orders_id" integer REFERENCES "orders"("id") ON DELETE CASCADE,
      "order_items_id" integer REFERENCES "order_items"("id") ON DELETE CASCADE,
      "downloads_id" integer REFERENCES "downloads"("id") ON DELETE CASCADE,
      "support_tickets_id" integer REFERENCES "support_tickets"("id") ON DELETE CASCADE,
      "support_messages_id" integer REFERENCES "support_messages"("id") ON DELETE CASCADE,
      "access_grants_id" integer REFERENCES "access_grants"("id") ON DELETE CASCADE,
      "audit_logs_id" integer REFERENCES "audit_logs"("id") ON DELETE CASCADE
    );

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

    CREATE TABLE IF NOT EXISTS "payload_migrations" (
      "id" serial PRIMARY KEY,
      "name" varchar,
      "batch" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    DROP TABLE IF EXISTS "payload_preferences_rels" CASCADE;
    DROP TABLE IF EXISTS "payload_preferences" CASCADE;
    DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;
    DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;
    DROP TABLE IF EXISTS "audit_logs" CASCADE;
    DROP TABLE IF EXISTS "access_grants" CASCADE;
    DROP TABLE IF EXISTS "support_messages" CASCADE;
    DROP TABLE IF EXISTS "support_tickets" CASCADE;
    DROP TABLE IF EXISTS "downloads" CASCADE;
    DROP TABLE IF EXISTS "order_items" CASCADE;
    DROP TABLE IF EXISTS "orders" CASCADE;
    DROP TABLE IF EXISTS "subscribers_topics" CASCADE;
    DROP TABLE IF EXISTS "subscribers" CASCADE;
    DROP TABLE IF EXISTS "contact_submissions" CASCADE;
    DROP TABLE IF EXISTS "customer_addresses" CASCADE;
    DROP TABLE IF EXISTS "books" CASCADE;
    DROP TABLE IF EXISTS "users_sessions" CASCADE;
    DROP TABLE IF EXISTS "users" CASCADE;
    DROP TABLE IF EXISTS "payload_migrations" CASCADE;
  `);
}
