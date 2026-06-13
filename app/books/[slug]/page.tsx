import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import ImageSlot from "../../components/ImageSlot";
import ProductActions from "../../components/ProductActions";
import { books, getBookBySlug } from "@/lib/books";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return { title: "Book Not Found" };
  return {
    title: book.title,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      images: [{ url: book.coverImage, width: 900, height: 1200 }]
    }
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-3">
        <div className="mb-4 text-sm font-semibold text-[#6b7d80]"><Link href="/">Home</Link> / <Link href="/books">Books</Link> / {book.title}</div>
        <section className="grid gap-10 md:grid-cols-2">
          <div>
            <ImageSlot src={book.coverImage} alt={`${book.title} cover`} label={`Book ${book.number} Cover`} note={book.coverImage} className="aspect-[3/4] rounded-3xl border-2 border-dashed" />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <ImageSlot src={book.coverImage} alt="Cover thumbnail" label="Cover" className="aspect-square rounded-xl border-dashed" />
              <ImageSlot src={`/images/book-${book.number}-page-1.png`} alt="Inside page preview" label="Page" note={`book-${book.number}-page-1.png`} className="aspect-square rounded-xl border-dashed" />
              <ImageSlot src={`/images/book-${book.number}-page-2.png`} alt="Inside page preview" label="Page" note={`book-${book.number}-page-2.png`} className="aspect-square rounded-xl border-dashed" />
            </div>
          </div>
          <div>
            <div className="small-label">Book {book.number} · The Adventure Series</div>
            <h1 className="mt-2 font-serif text-4xl font-semibold leading-tight text-teal">{book.title}</h1>
            <p className="mt-3 text-sm font-extrabold text-[#6b7d80]">Topic: {book.topic} · Ages {book.ages} · {book.pages} pages</p>
            <p className="my-6 text-base leading-8 text-ink">{book.longDescription}</p>
            <ProductActions book={book} />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
