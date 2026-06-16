import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";
import SetPasswordByTokenClient from "../../../components/SetPasswordByTokenClient";

export const metadata: Metadata = { title: "Create Your Password" };

type Props = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function AccountSetPasswordPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const t = sp.token;
  const token = Array.isArray(t) ? t[0] : t || "";
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10 text-center">
        <p className="font-serif text-2xl italic text-coral">Almost there ♥</p>
        <h1 className="mt-2 font-serif text-[40px] font-bold leading-tight text-teal sm:text-5xl">Create Your Password</h1>
      </section>
      <section className="wrap pb-20">
        <SetPasswordByTokenClient token={token} />
      </section>
    </SiteShell>
  );
}
