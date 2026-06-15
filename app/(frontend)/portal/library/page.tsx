import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import PortalSessionBar from "../../../components/PortalSessionBar";
import PortalLibraryClient from "../../../components/PortalLibraryClient";

export const metadata: Metadata = {
  title: "My Library"
};

export default function PortalLibraryPage() {
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-2xl italic text-coral">My Library ♥</p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Purchased Books</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            View the Benny &amp; Penny books and formats linked to your customer account.
          </p>
        </div>
      </section>

      <PortalSessionBar />

      <section className="wrap pb-20">
        <PortalLibraryClient />
      </section>
    </SiteShell>
  );
}
