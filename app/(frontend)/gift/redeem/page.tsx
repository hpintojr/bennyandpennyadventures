import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import GiftRedeemClient from "../../../components/GiftRedeemClient";
import { books } from "@/lib/books";

export const metadata: Metadata = { title: "Redeem a Gift" };

type RedeemPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

function getParam(sp: Record<string, string | string[] | undefined>, key: string) {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function GiftRedeemPage({ searchParams }: RedeemPageProps) {
  const sp = searchParams ? await searchParams : {};
  const code = getParam(sp, "code") || "";
  const bookOptions = books.map((b) => ({ slug: b.slug, title: b.title }));

  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-2xl italic text-coral">A Gift for You ♥</p>
          <h1 className="mt-2 font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Redeem Your Gift</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            Someone gifted you a Benny &amp; Penny book. Create your free account to claim it and read it any time in your library.
          </p>
        </div>
      </section>
      <section className="wrap pb-20">
        <GiftRedeemClient initialCode={code} bookOptions={bookOptions} />
      </section>
    </SiteShell>
  );
}
