import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Terms of Service"
};

export default function TermsPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <h1 className="font-serif text-4xl font-semibold text-teal">Terms of Service</h1>
        <p className="mt-4 text-ink">This starter terms page is included as a placeholder. Replace this copy with final legal language before launch.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Educational content</h2>
        <p className="mt-2 text-ink">Benny &amp; Penny&rsquo;s Adventures provides children&rsquo;s educational and comfort-focused resources. It does not replace medical advice from a licensed medical professional or your child&rsquo;s care team.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Purchases</h2>
        <p className="mt-2 text-ink">Future digital and print purchases will be handled through connected payment and fulfillment providers.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Contact</h2>
        <p className="mt-2 text-ink">Questions can be sent to hello@bennyandpenny.com.</p>
      </article>
    </SiteShell>
  );
}
