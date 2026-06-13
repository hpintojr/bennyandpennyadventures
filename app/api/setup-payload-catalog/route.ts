import { bookFormats, books } from "@/lib/books";
import { Client } from "pg";

export const dynamic = "force-dynamic";

function jsonResponse(body: { ok: boolean; message: string; count?: number; error?: string }, status = 200) {
  return Response.json(body, { status });
}

const digitalFormat = bookFormats.find((format) => format.shortLabel === "Digital")!;
const audioFormat = bookFormats.find((format) => format.shortLabel === "Audio")!;
const paperbackFormat = bookFormats.find((format) => format.shortLabel === "Paperback")!;
const hardcoverFormat = bookFormats.find((format) => format.shortLabel === "Hardcover")!;

const createBooksTableSql = `
CREATE TABLE IF NOT EXISTS "books" (
  "id" serial PRIMARY KEY,
  "title" varchar NOT NULL,
  "slug" varchar NOT NULL UNIQUE,
  "number" numeric NOT NULL,
  "topic" varchar,
  "ages" varchar,
  "pages" numeric,
  "badge" varchar,
  "status" varchar DEFAULT 'coming-soon' NOT NULL,
  "short_description" varchar,
  "long_description" varchar,
  "cover_image" varchar,
  "cover_image_path" varchar,
  "page_preview_one" varchar,
  "page_preview_two" varchar,
  "pdf_path" varchar,
  "epub_path" varchar,
  "audio_path" varchar,
  "price_digital" numeric DEFAULT 15.99,
  "price_audiobook" numeric DEFAULT 21.99,
  "price_paperback" numeric DEFAULT 17.99,
  "price_hardcover" numeric DEFAULT 24.99,
  "digital_description" varchar,
  "audiobook_description" varchar,
  "paperback_description" varchar,
  "hardcover_description" varchar,
  "pdf_object_key" varchar,
  "epub_object_key" varchar,
  "audiobook_object_key" varchar,
  "stripe_lookup_key" varchar,
  "stripe_digital_price_id" varchar,
  "stripe_audiobook_price_id" varchar,
  "stripe_paperback_price_id" varchar,
  "stripe_hardcover_price_id" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "badge" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "cover_image" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "page_preview_one" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "page_preview_two" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "pdf_path" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "epub_path" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "audio_path" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "digital_description" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "audiobook_description" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "paperback_description" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "hardcover_description" varchar;
ALTER TABLE "books" ADD COLUMN IF NOT EXISTS "stripe_lookup_key" varchar;

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
          "badge",
          "status",
          "short_description",
          "long_description",
          "cover_image",
          "cover_image_path",
          "page_preview_one",
          "page_preview_two",
          "pdf_path",
          "epub_path",
          "audio_path",
          "price_digital",
          "price_audiobook",
          "price_paperback",
          "price_hardcover",
          "digital_description",
          "audiobook_description",
          "paperback_description",
          "hardcover_description",
          "pdf_object_key",
          "epub_object_key",
          "audiobook_object_key",
          "stripe_lookup_key",
          "updated_at"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, now())
        ON CONFLICT ("slug") DO UPDATE SET
          "title" = EXCLUDED."title",
          "number" = EXCLUDED."number",
          "topic" = EXCLUDED."topic",
          "ages" = EXCLUDED."ages",
          "pages" = EXCLUDED."pages",
          "badge" = EXCLUDED."badge",
          "status" = EXCLUDED."status",
          "short_description" = EXCLUDED."short_description",
          "long_description" = EXCLUDED."long_description",
          "cover_image" = EXCLUDED."cover_image",
          "cover_image_path" = EXCLUDED."cover_image_path",
          "page_preview_one" = EXCLUDED."page_preview_one",
          "page_preview_two" = EXCLUDED."page_preview_two",
          "pdf_path" = EXCLUDED."pdf_path",
          "epub_path" = EXCLUDED."epub_path",
          "audio_path" = EXCLUDED."audio_path",
          "price_digital" = EXCLUDED."price_digital",
          "price_audiobook" = EXCLUDED."price_audiobook",
          "price_paperback" = EXCLUDED."price_paperback",
          "price_hardcover" = EXCLUDED."price_hardcover",
          "digital_description" = EXCLUDED."digital_description",
          "audiobook_description" = EXCLUDED."audiobook_description",
          "paperback_description" = EXCLUDED."paperback_description",
          "hardcover_description" = EXCLUDED."hardcover_description",
          "pdf_object_key" = EXCLUDED."pdf_object_key",
          "epub_object_key" = EXCLUDED."epub_object_key",
          "audiobook_object_key" = EXCLUDED."audiobook_object_key",
          "stripe_lookup_key" = EXCLUDED."stripe_lookup_key",
          "updated_at" = now()
        `,
        [
          book.title,
          book.slug,
          book.number,
          book.topic,
          book.ages,
          book.pages,
          book.badge,
          book.status,
          book.description,
          book.longDescription,
          book.coverImage,
          `/images/book-${book.number}-page-1.png`,
          `/images/book-${book.number}-page-2.png`,
          book.pdfPath,
          book.epubPath,
          book.audioPath,
          digitalFormat.price,
          audioFormat.price,
          paperbackFormat.price,
          hardcoverFormat.price,
          digitalFormat.description,
          audioFormat.description,
          paperbackFormat.description,
          hardcoverFormat.description,
          book.pdfPath.replace("/downloads/", "ebooks/"),
          book.epubPath.replace("/downloads/", "ebooks/"),
          book.audioPath.replace("/downloads/", "audiobooks/"),
          book.stripeLookupKey
        ]
      );
    }

    return jsonResponse({
      ok: true,
      message: "Payload Books catalog table was aligned with the product pages and seeded.",
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
