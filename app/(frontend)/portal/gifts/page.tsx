import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import PortalSessionBar from "../../../components/PortalSessionBar";
import PortalGiftsClient from "../../../components/PortalGiftsClient";

export const metadata: Metadata = { title: "Gift a Book" };

export default function PortalGiftsPage() {
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-serif text-2xl italic text-coral">Gifting ♥</p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Gift a Book</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            Share a digital book from your library. Each gift uses one of your download slots and gives a friend their own free copy.
          </p>
        </div>
      </section>

      <PortalSessionBar />

      <section className="wrap pb-20">
        <PortalGiftsClient />
      </section>
    </SiteShell>
  );
}
