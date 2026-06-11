import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Privacy Policy"
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <h1 className="font-serif text-4xl font-semibold text-teal">Privacy Policy</h1>
        <p className="mt-4 text-ink">This starter privacy page is included so the site has a complete route before launch. Replace this copy with final legal language before accepting payments or collecting newsletter subscribers.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Information we collect</h2>
        <p className="mt-2 text-ink">The current static site may collect an email address through newsletter forms and contact details through email links or forms you connect later.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Payments and downloads</h2>
        <p className="mt-2 text-ink">Future payments should be processed through Stripe. Future ebook delivery should use private storage and signed, time-limited links.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Contact</h2>
        <p className="mt-2 text-ink">Questions can be sent to hello@bennyandpenny.com.</p>
      </article>
    </SiteShell>
  );
}
