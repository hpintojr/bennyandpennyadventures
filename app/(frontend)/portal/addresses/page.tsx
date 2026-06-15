import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "../../../components/SiteShell";

export const metadata: Metadata = {
  title: "My Addresses"
};

export default function PortalAddressesPage() {
  return (
    <SiteShell>
      <section className="wrap pb-20 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-2xl italic text-coral">Addresses ♥</p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Billing &amp; Shipping Addresses</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            This page will show the billing and shipping addresses linked to the logged-in customer through Customer Addresses.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-dashed border-tan bg-white/60 p-8 text-center shadow-soft">
          <h2 className="font-serif text-3xl font-bold text-teal">Address data connection comes next</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink">
            The backend is already saving billing and shipping data from Stripe. The next pass will display those records here for the signed-in customer.
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
