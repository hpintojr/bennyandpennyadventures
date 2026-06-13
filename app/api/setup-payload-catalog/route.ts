import { books } from "@/lib/books";
import { Client } from "pg";

export const dynamic = "force-dynamic";

function jsonResponse(body: { ok: boolean; message: string; count?: number; error?: string }, status = 200) {
  return Response.json(body, { status });
}

const createBooksTableSql = `
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

CREATE INDEX IF NOT EXISTS "books_created_at_idx" ON "books" ("created_at");
CREATE INDEX IF NOT EXISTS "books_slug_idx" ON "books" ("slug");
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
    await client.query(createBooksTableSql);

    for (const book of books) {
      await client.query(
        `
        INSERT INTO "books" (
          "title",
          "slug",
          "number",
          "topic",
          "ages",
          "pages",
          "status",
          "short_description",
          "long_description",
          "cover_image_path",
          "price_digital",
          "price_audiobook",
          "price_paperback",
          "price_hardcover",
          "pdf_object_key",
          "epub_object_key",
          "audiobook_object_key",
          "updated_at"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 15.99, 21.99, 17.99, 24.99, $11, $12, $13, now())
        ON CONFLICT ("slug") DO UPDATE SET
          "title" = EXCLUDED."title",
          "number" = EXCLUDED."number",
          "topic" = EXCLUDED."topic",
          "ages" = EXCLUDED."ages",
          "pages" = EXCLUDED."pages",
          "status" = EXCLUDED."status",
          "short_description" = EXCLUDED."short_description",
          "long_description" = EXCLUDED."long_description",
          "cover_image_path" = EXCLUDED."cover_image_path",
          "pdf_object_key" = EXCLUDED."pdf_object_key",
          "epub_object_key" = EXCLUDED."epub_object_key",
          "audiobook_object_key" = EXCLUDED."audiobook_object_key",
          "updated_at" = now()
        `,
        [
          book.title,
          book.slug,
          book.number,
          book.topic,
          book.ages,
          book.pages,
          book.status === "cover-ready" ? "live" : "coming-soon",
          book.description,
          book.longDescription,
          book.coverImage,
          book.pdfPath.replace("/downloads/", "ebooks/"),
          book.epubPath.replace("/downloads/", "ebooks/"),
          book.audioPath.replace("/downloads/", "audiobooks/")
        ]
      );
    }

    return jsonResponse({
      ok: true,
      message: "Payload Books catalog table was created and seeded.",
      count: books.length
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: "Payload catalog setup failed.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}
