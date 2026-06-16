import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../../components/SiteShell";
import PortalSessionBar from "../../components/PortalSessionBar";

export const metadata: Metadata = {
  title: "Customer Portal"
};

const portalCards = [
  {
    title: "My Orders",
    text: "View your Benny & Penny orders, totals, formats, and fulfillment status.",
    href: "/portal/orders",
    cta: "View Orders"
  },
  {
    title: "My Library",
    text: "See the books and formats linked to your customer account.",
    href: "/portal/library",
    cta: "View Library"
  },
  {
    title: "Addresses",
    text: "Review billing and shipping addresses collected through checkout.",
    href: "/portal/addresses",
    cta: "View Addresses"
  }
];

export default function PortalPage() {
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-8 text-center">
        <p className="font-serif text-xl italic text-coral sm:text-2xl">Customer Portal ♥</p>
        <h1 className="mx-auto mt-2 max-w-3xl font-serif text-[36px] font-bold leading-tight text-teal sm:text-6xl">Your Benny &amp; Penny Adventure Library</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink sm:text-lg sm:leading-8">
          This is the foundation for customer accounts: orders, purchased books, and addresses in one gentle, family-friendly place.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <Link href="/portal/login" className="btn text-base sm:text-lg">Sign In ♥</Link>
          <Link href="/books" className="btn-ghost text-base sm:text-lg">Shop Books</Link>
        </div>
      </section>

      <PortalSessionBar />

      <section className="wrap grid gap-4 pb-20 pt-8 sm:gap-5 md:grid-cols-3">
        {portalCards.map((card) => (
          <Link key={card.title} href={card.href} className="group rounded-[1.5rem] border border-tan bg-white/70 p-5 shadow-soft transition hover:-translate-y-1 hover:border-coral/50 hover:bg-white sm:rounded-[2rem] sm:p-7">
            <h2 className="font-serif text-2xl font-bold text-teal group-hover:text-coral sm:text-3xl">{card.title}</h2>
            <p className="mt-3 text-base leading-7 text-ink">{card.text}</p>
            <span className="mt-5 inline-flex font-bold text-coral">{card.cta} →</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
