import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Thank You"
};

export default function ThankYouPage() {
  return (
    <SiteShell>
      <section className="page-wrap flex min-h-[60vh] flex-col items-center justify-center pb-20 pt-10 text-center">
        <h1 className="font-serif text-5xl font-semibold text-teal">Thank You!</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">You are now part of the Benny and Penny family. We will send gentle updates on new books and resources.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/books" className="btn">Explore Our Books</Link>
          <Link href="/" className="btn-ghost">Back to Home</Link>
        </div>
      </section>
    </SiteShell>
  );
}
