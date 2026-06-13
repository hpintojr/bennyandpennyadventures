import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <h1 className="font-serif text-4xl font-semibold text-teal">Terms of Use</h1>
        <p className="mt-4 text-ink">These terms govern use of the Benny and Penny's Adventures website, products, and resources.</p>
      </article>
    </SiteShell>
  );
}
