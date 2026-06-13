import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <h1 className="font-serif text-4xl font-semibold text-teal">Privacy Policy</h1>
        <p className="mt-4 text-ink">Benny and Penny's Adventures respects your privacy. Please contact hello@bennyandpenny.com with questions.</p>
      </article>
    </SiteShell>
  );
}
