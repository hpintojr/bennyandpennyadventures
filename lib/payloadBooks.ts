import "server-only";

import { Client } from "pg";
import { books as fallbackBooks, type Book } from "./books";

type BookRow = {
  number: string | number;
  slug: string;
  title: string;
  topic: string | null;
  ages: string | null;
  pages: string | number | null;
  badge: string | null;
  status: string | null;
  short_description: string | null;
  long_description: string | null;
  cover_image: string | null;
  cover_image_path: string | null;
  pdf_path: string | null;
  epub_path: string | null;
  audio_path: string | null;
  stripe_lookup_key: string | null;
};

function statusToBookStatus(status: string | null): Book["status"] {
  if (status === "live" || status === "cover-ready") return "cover-ready";
  return "coming-soon";
}

function rowToBook(row: BookRow): Book {
  const number = Number(row.number);

  return {
    number,
    slug: row.slug,
    title: row.title,
    topic: row.topic || "Medical adventure",
    ages: row.ages || "3–8",
    pages: Number(row.pages || 32),
    coverImage: row.cover_image || row.cover_image_path || `/images/book-${number}.png`,
    badge: row.badge || (statusToBookStatus(row.status) === "cover-ready" ? "Cover ready" : "Art needed"),
    status: statusToBookStatus(row.status),
    description: row.short_description || "A gentle Benny & Penny medical adventure.",
    longDescription: row.long_description || row.short_description || "A gentle Benny & Penny medical adventure.",
    pdfPath: row.pdf_path || `/downloads/book-${number}.pdf`,
    epubPath: row.epub_path || `/downloads/book-${number}.epub`,
    audioPath: row.audio_path || `/downloads/book-${number}-audiobook.mp3`,
    stripeLookupKey: row.stripe_lookup_key || `book_${number}_digital`
  };
}

async function queryBooks(): Promise<Book[]> {
  const databaseUri = process.env.DATABASE_URI;

  if (!databaseUri) return fallbackBooks;

  const client = new Client({ connectionString: databaseUri });

  try {
    await client.connect();

    const result = await client.query<BookRow>(`
      select
        number,
        slug,
        title,
        topic,
        ages,
        pages,
        badge,
        status,
        short_description,
        long_description,
        cover_image,
        cover_image_path,
        pdf_path,
        epub_path,
        audio_path,
        stripe_lookup_key
      from books
      order by number asc
    `);

    if (!result.rows.length) return fallbackBooks;

    return result.rows.map(rowToBook);
  } catch (error) {
    console.error("Falling back to local book catalog because Payload books could not be loaded", error);
    return fallbackBooks;
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function getPayloadBooks(): Promise<Book[]> {
  return queryBooks();
}

export async function getPayloadBookBySlug(slug: string): Promise<Book | undefined> {
  const books = await queryBooks();
  return books.find((book) => book.slug === slug);
}
