import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../../components/SiteShell";

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
    title: "Purchased Books",
    text: "Access purchased digital books and audiobook delivery links once fulfillment is connected.",
    href: "/portal/orders",
    cta: "View Purchases"
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
      <section className="wrap pb-16 pt-8 text-center">
        <p className="font-serif text-2xl italic text-coral">Customer Portal ♥</p>
        <h1 className="mx-auto mt-2 max-w-3xl font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Your Benny &amp; Penny Adventure Library</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
          This is the foundation for customer accounts: orders, purchased books, and addresses in one gentle, family-friendly place.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/portal/login" className="btn text-lg">Sign In ♥</Link>
          <Link href="/books" className="btn-ghost text-lg">Shop Books</Link>
        </div>
      </section>

      <section className="wrap grid gap-5 pb-20 md:grid-cols-3">
        {portalCards.map((card) => (
          <Link key={card.title} href={card.href} className="group rounded-[2rem] border border-tan bg-white/70 p-7 shadow-soft transition hover:-translate-y-1 hover:border-coral/50 hover:bg-white">
            <h2 className="font-serif text-3xl font-bold text-teal group-hover:text-coral">{card.title}</h2>
            <p className="mt-3 text-base leading-7 text-ink">{card.text}</p>
            <span className="mt-5 inline-flex font-bold text-coral">{card.cta} →</span>
          </Link>
        ))}
      </section>
    </SiteShell>
  );
}
