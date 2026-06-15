import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../../../components/SiteShell";

export const metadata: Metadata = {
  title: "My Orders"
};

export default function PortalOrdersPage() {
  return (
    <SiteShell>
      <section className="wrap pb-20 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-2xl italic text-coral">My Orders ♥</p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Order History</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            This page is ready to connect to the logged-in customer&apos;s Payload order history: order number, status, totals, purchased formats, and delivery access.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-dashed border-tan bg-white/60 p-8 text-center shadow-soft">
          <h2 className="font-serif text-3xl font-bold text-teal">Order data connection comes next</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink">
            The source of truth is already in Payload: Orders linked to Customers, with Order Details for each purchased book format.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link href="/portal/login" className="btn">Sign In</Link>
            <Link href="/portal" className="btn-ghost">Portal Home</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
