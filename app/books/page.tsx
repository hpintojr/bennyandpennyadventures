import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";
import ImageSlot from "../components/ImageSlot";
import { books, bookFormats, formatMoney } from "@/lib/books";

export const metadata: Metadata = {
  title: "Our Books",
  description: "Browse Benny & Penny's Adventures children's medical book series."
};

export default function BooksPage() {
  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-4">
        <section className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">Our Books <span className="text-coral">♥</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink">A growing series that turns real medical experiences into gentle, brave little adventures. New titles release as they&rsquo;re illustrated — join our community to hear first.</p>
        </section>

        <section className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <article key={book.slug} className="panel-card flex overflow-hidden rounded-[20px] flex-col">
              <ImageSlot src={book.coverImage} alt={`${book.title} cover`} label={`Book ${book.number} Cover`} note={book.coverImage} className="aspect-[3/4] rounded-none border-x-0 border-t-0">
              </ImageSlot>
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
                <Link className="btn-ghost mt-2 self-start px-4 py-2 text-sm" href={`/books/${book.slug}`}>View &amp; choose format →</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="grid items-center gap-8 rounded-3xl bg-teal p-8 text-white md:grid-cols-[1.3fr_0.9fr] md:p-10">
          <div>
            <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl">Get the Full Series</h2>
            <p className="mt-4 text-[#f3e7d3]">Launch with individual titles first, then use this area for a bundle offer when all PDFs/EPUBs and print editions are ready.</p>
            <p className="mt-5 font-serif text-2xl">Bundle setup coming after Stripe products are created.</p>
            <Link className="btn mt-6" href="/contact">Ask about bulk orders ♥</Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {books.map((book) => (
              <div key={book.slug} className="grid h-[78px] w-[58px] place-items-center overflow-hidden rounded-lg border border-white/30 bg-white/15 font-serif text-sm text-white">
                <span>Book {book.number}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
