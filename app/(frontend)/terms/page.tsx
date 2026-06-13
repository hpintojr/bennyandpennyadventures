import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Benny & Penny's Adventures."
};

const contactEmail = "hello@bennyandpenny.com";

export default function TermsPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 13, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">Terms of Use</h1>

        <p className="mt-4 text-ink">
          These Terms describe use of the Benny &amp; Penny&rsquo;s Adventures website and related books, downloads, audio products, print products, forms, and resources.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Adult Website Use</h2>
        <p className="mt-2 text-ink">
          Website forms, purchases, newsletter signups, and account activity are intended for adults, including parents, guardians, caregivers, educators, and healthcare professionals.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Educational Content</h2>
        <p className="mt-2 text-ink">
          Our books and resources are for education, comfort, encouragement, and family support. They do not replace guidance from a qualified healthcare professional or your child&rsquo;s care team.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Products and Purchases</h2>
        <p className="mt-2 text-ink">
          We may offer PDF, EPUB, audiobook, paperback, hardcover, bundle, and related products. Prices, availability, formats, and product details may change over time.
        </p>
        <p className="mt-3 text-ink">
          Digital and audio access may use private, time-limited links. Access limits may apply so we can protect paid products and help customers who need support.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Print Orders</h2>
        <p className="mt-2 text-ink">
          Print books may be fulfilled through print-on-demand partners. Production and shipping times may vary.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Email and Contact Forms</h2>
        <p className="mt-2 text-ink">
          If you join our email list, you may receive updates, book announcements, printables, and related resources. You may unsubscribe from marketing emails at any time. Contact forms should be used only for genuine inquiries.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Intellectual Property</h2>
        <p className="mt-2 text-ink">
          Website content, books, illustrations, characters, downloads, branding, and related materials belong to Benny &amp; Penny&rsquo;s Adventures or its creators unless otherwise stated. Please do not copy, resell, redistribute, upload, or publicly share paid products or private download links without permission.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Third-Party Services</h2>
        <p className="mt-2 text-ink">
          We may use providers for hosting, email delivery, payments, storage, analytics, and print fulfillment. Those providers may have their own terms and policies.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Contact</h2>
        <p className="mt-2 text-ink">
          Questions about these Terms can be sent to <a className="font-extrabold text-coral" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </article>
    </SiteShell>
  );
}
