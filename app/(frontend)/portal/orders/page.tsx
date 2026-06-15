import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import PortalOrdersClient from "../../../components/PortalOrdersClient";

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
            View your Benny &amp; Penny orders, purchased formats, totals, and shipping details.
          </p>
        </div>

        <PortalOrdersClient />
      </section>
    </SiteShell>
  );
}
