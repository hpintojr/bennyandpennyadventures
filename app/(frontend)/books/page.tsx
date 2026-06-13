import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import ImageSlot from "../../components/ImageSlot";
import { bookFormats, formatMoney } from "@/lib/books";
import { getPayloadBooks } from "@/lib/payloadBooks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Books",
  description: "Browse Benny and Penny books."
};

export default async function BooksPage() {
  const books = await getPayloadBooks();

  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-4">
        <section className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">Our Books</h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink">A growing series that turns real medical experiences into gentle, brave little adventures.</p>
        </section>

        <section className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <article key={book.slug} className="panel-card flex overflow-hidden rounded-[20px] flex-col">
              <ImageSlot src={book.coverImage} alt={`${book.title} cover`} label={`Book ${book.number} Cover`} note={book.coverImage} className="aspect-[3/4] rounded-none border-x-0 border-t-0" />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="small-label">Book {book.number}</div>
                <h2 className="font-serif text-xl leading-tight text-teal">{book.title}</h2>
                <p className="text-xs font-extrabold text-[#6b7d80]">Topic: {book.topic}</p>
                <p className="flex-1 text-sm leading-6 text-ink">{book.description}</p>
                <p className="text-xs font-extrabold text-teal">
                  {bookFormats.map((format, index) => (
                    <span key={format.label}>{index > 0 ? " · " : ""}{format.shortLabel} {formatMoney(format.price)}</span>
                  ))}
                </p>
                <Link className="btn-ghost mt-2 self-start px-4 py-2 text-sm" href={`/books/${book.slug}`}>View and choose format</Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
