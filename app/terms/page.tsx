import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Benny & Penny's Adventures."
};

const contactEmail = "hello@bennyandpenny.com";

export default function TermsPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 13, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">Terms of Service</h1>

        <p className="mt-4 text-ink">
          These Terms of Service describe the rules for using the Benny &amp; Penny&rsquo;s Adventures website and purchasing or accessing our books, digital downloads, print products, and related resources. By using this website, you agree to these Terms.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Adult Use of the Website</h2>
        <p className="mt-2 text-ink">
          Benny &amp; Penny&rsquo;s Adventures creates family-friendly books and resources, but website forms, purchases, newsletter signups, and account-related activity are intended for adults, including parents, guardians, caregivers, educators, and healthcare professionals. Children should use this website only with adult supervision.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Educational and Comfort-Focused Content</h2>
        <p className="mt-2 text-ink">
          Our books and resources are created for education, comfort, encouragement, and family support. They are not medical advice and do not replace guidance from a licensed medical professional, healthcare provider, or your child&rsquo;s care team. Always follow instructions from qualified healthcare professionals for medical decisions, treatment, procedures, and care.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Purchases</h2>
        <p className="mt-2 text-ink">
          We may offer digital books, print books, bundles, and related resources for purchase. Prices, availability, formats, and product details may change at any time. Payment processing may be handled by Stripe or another secure payment provider.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Digital Products: PDF and EPUB Downloads</h2>
        <p className="mt-2 text-ink">
          Digital products may be delivered as PDF, EPUB, or other downloadable formats. Digital downloads are for personal, non-commercial use by the purchaser and their household, classroom, or care setting unless a separate written license says otherwise.
        </p>
        <p className="mt-3 text-ink">
          Download links may be time-limited, access-limited, or both. Unless otherwise stated at checkout, we may limit each purchased digital file to a maximum of three downloads. We may also use short-lived signed links that expire for security purposes. If you have trouble accessing a purchased file, contact us for help.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Print Products and Print-on-Demand</h2>
        <p className="mt-2 text-ink">
          Print books may be fulfilled through a print-on-demand provider, such as Lulu or another fulfillment partner. Print production and shipping times may vary. We are not responsible for carrier delays, incorrect shipping information provided by the customer, or fulfillment issues outside our reasonable control, but we will make reasonable efforts to help resolve order issues.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Refunds and Cancellations</h2>
        <p className="mt-2 text-ink">
          Because digital products can be accessed immediately, digital downloads are generally final sale once access has been provided, unless required by law or unless we choose to make an exception. If a file is defective, inaccessible, or incorrect, contact us and we will make reasonable efforts to fix the issue or provide replacement access.
        </p>
        <p className="mt-3 text-ink">
          Print product refund, replacement, or cancellation options may depend on the status of the print order and the policies of the fulfillment provider.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Email List and Communications</h2>
        <p className="mt-2 text-ink">
          If you join our email list, you agree to receive updates, book announcements, printables, resources, and related communications from Benny &amp; Penny&rsquo;s Adventures. You may unsubscribe from marketing emails at any time.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Contact Forms</h2>
        <p className="mt-2 text-ink">
          When you submit a contact form, you agree to provide accurate information and understand that we may use your submission to respond to your inquiry. You may not use our forms to send spam, unlawful content, abusive messages, or misleading information.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Intellectual Property</h2>
        <p className="mt-2 text-ink">
          All website content, books, illustrations, characters, designs, text, downloads, branding, and related materials are owned by Benny &amp; Penny&rsquo;s Adventures or its creators unless otherwise stated. You may not copy, reproduce, distribute, resell, upload, share, modify, or create derivative works from our content without written permission, except as allowed by law or by a license we provide.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Acceptable Use</h2>
        <p className="mt-2 text-ink">You agree not to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-ink">
          <li>Use the website for unlawful, harmful, abusive, or fraudulent purposes.</li>
          <li>Attempt to bypass download limits, access controls, or security protections.</li>
          <li>Share private digital download links publicly or with unauthorized users.</li>
          <li>Interfere with the website, servers, forms, checkout, or digital delivery systems.</li>
          <li>Use automated tools to scrape, copy, or misuse the website or its content.</li>
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">Third-Party Services</h2>
        <p className="mt-2 text-ink">
          We may use third-party providers for hosting, email delivery, payments, digital storage, analytics, and print fulfillment. These providers may have their own terms and policies. We are not responsible for third-party websites or services that we do not control.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">No Guarantees</h2>
        <p className="mt-2 text-ink">
          We work to keep the website accurate, available, and helpful, but we do not guarantee that the website, downloads, forms, or services will always be uninterrupted, error-free, or available. Content may be updated, removed, or changed at any time.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Limitation of Liability</h2>
        <p className="mt-2 text-ink">
          To the fullest extent allowed by law, Benny &amp; Penny&rsquo;s Adventures and its creators will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the website, products, downloads, or services.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Changes to These Terms</h2>
        <p className="mt-2 text-ink">
          We may update these Terms from time to time. The updated version will be posted on this page with a new last updated date. Continued use of the website after changes are posted means you accept the updated Terms.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Contact</h2>
        <p className="mt-2 text-ink">
          Questions about these Terms can be sent to <a className="font-extrabold text-coral" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </article>
    </SiteShell>
  );
}
