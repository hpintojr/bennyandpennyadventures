import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import PortalSessionBar from "../../../components/PortalSessionBar";
import PortalAddressesClient from "../../../components/PortalAddressesClient";

export const metadata: Metadata = {
  title: "My Addresses"
};

export default function PortalAddressesPage() {
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-2xl italic text-coral">Addresses ♥</p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Billing &amp; Shipping Addresses</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            View billing and shipping addresses linked to your Benny &amp; Penny customer account.
          </p>
        </div>
      </section>

      <PortalSessionBar />

      <section className="wrap pb-20">
        <PortalAddressesClient />
      </section>
    </SiteShell>
  );
}
