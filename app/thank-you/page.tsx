import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Thank You"
};

export default function ThankYouPage() {
  return (
    <SiteShell>
      <section className="page-wrap flex min-h-[60vh] flex-col items-center justify-center pb-20 pt-10 text-center">
        <div className="mb-6 grid h-24 w-24 place-items-center rounded-full bg-blush text-5xl text-coral">♥</div>
        <h1 className="font-serif text-5xl font-semibold text-teal"><span className="text-coral">♥</span> Thank You! <span className="text-coral">♥</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">You&rsquo;re now part of the Benny &amp; Penny family. We&rsquo;ll send gentle updates on new books, brave little resources, and the moment the shop opens — no spam, ever.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/books" className="btn">Explore Our Books ♥</Link>
          <Link href="/" className="btn-ghost">Back to Home</Link>
        </div>
        <div className="mt-9 font-serif text-2xl italic text-coral">&ldquo;Every child is braver than they believe.&rdquo; — Nurse Ivy ♥</div>
      </section>
    </SiteShell>
  );
}
