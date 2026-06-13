import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Benny & Penny's Adventures."
};

const contactEmail = "hello@bennyandpenny.com";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 13, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">Privacy Policy</h1>

        <p className="mt-4 text-ink">
          Benny &amp; Penny&rsquo;s Adventures respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you visit our website, contact us, join our email list, or purchase digital, audio, or print products from us.
        </p>

        <p className="mt-4 rounded-2xl border border-tan bg-blush p-4 text-sm text-ink">
          This website is created for families, parents, caregivers, educators, and children, but website forms, purchases, newsletter signups, and account-related activity are intended for adults. We do not knowingly collect personal information directly from children.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Information We Collect</h2>
        <p className="mt-2 text-ink">We may collect information you choose to provide, including:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-ink">
          <li>Your name and email address when you submit the contact form.</li>
          <li>Your inquiry type and message when you contact us.</li>
          <li>Your email address when you join our newsletter or email list.</li>
          <li>Purchase and order information when you buy digital, audio, or print products.</li>
          <li>Download or access information for PDF, EPUB, audiobook, or audio products, such as download count, access status, file type, and expiration details.</li>
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">How We Use Information</h2>
        <p className="mt-2 text-ink">We use information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-ink">
          <li>Respond to questions and contact form submissions.</li>
          <li>Send website inquiry notifications to our business email.</li>
          <li>Send newsletter updates, book release announcements, printables, and related resources when you sign up.</li>
          <li>Process purchases and provide access to digital downloads, audiobooks, audio files, or print orders.</li>
          <li>Track download/access limits and help prevent unauthorized sharing.</li>
          <li>Improve the website, customer experience, and product offerings.</li>
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">Contact Forms and Email Notifications</h2>
        <p className="mt-2 text-ink">
          When you submit a contact form, your submission may be sent to us by email and may also be stored in our website backend so we can review and respond. We may use service providers, such as Mailjet or another email provider, to deliver these notifications.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Newsletter and Email List</h2>
        <p className="mt-2 text-ink">
          If you join our email list, we may send you updates about Benny &amp; Penny&rsquo;s Adventures, new books, resources, printables, and related announcements. You can unsubscribe from marketing emails at any time using the unsubscribe link in those emails or by contacting us.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Payments</h2>
        <p className="mt-2 text-ink">
          Payments are expected to be processed through Stripe or another secure payment provider. We do not store full credit card numbers on our website. Payment providers may collect and process payment information according to their own privacy policies.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Digital Downloads and Audiobooks</h2>
        <p className="mt-2 text-ink">
          PDF, EPUB, audiobook, and other audio files may be delivered using private storage, such as Cloudflare R2, and signed, time-limited links. We may track download or access activity, including the number of downloads or plays, file type, purchase record, and link expiration, to provide access and protect our digital and audio products.
        </p>
        <p className="mt-3 text-ink">
          If audiobook streaming, playback, or third-party audio delivery is added later, the provider may process technical information needed to deliver the audio experience, such as device/browser information, access logs, playback requests, and IP address.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Print-on-Demand Orders</h2>
        <p className="mt-2 text-ink">
          If print books are offered, order details may be shared with a print-on-demand provider, such as Lulu or another fulfillment partner, only as needed to print and ship your order.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Cookies and Analytics</h2>
        <p className="mt-2 text-ink">
          We may use basic cookies, analytics, or similar technologies to understand website traffic, improve the website, and support site functionality. If additional analytics or advertising tools are added later, this policy should be updated to describe them.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">How We Share Information</h2>
        <p className="mt-2 text-ink">We do not sell personal information. We may share information with trusted service providers who help us operate the website, send emails, process payments, deliver digital/audio files, fulfill print orders, or comply with legal obligations.</p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Data Security</h2>
        <p className="mt-2 text-ink">
          We use reasonable administrative, technical, and organizational safeguards to protect information. No website or online service can guarantee complete security, but we work to keep information protected and use reputable providers for payments, email, hosting, and storage.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Your Choices</h2>
        <p className="mt-2 text-ink">
          You may contact us to request that we update, correct, or delete information you have provided, subject to legal, accounting, security, and transaction recordkeeping needs. You may unsubscribe from marketing emails at any time.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Children&rsquo;s Privacy</h2>
        <p className="mt-2 text-ink">
          Our books and resources may be created for children and families, but this website is intended to be used by adults, including parents, guardians, caregivers, educators, and healthcare professionals. We do not knowingly collect personal information directly from children. If you believe a child has provided personal information to us, please contact us so we can review and delete it if appropriate.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Changes to This Policy</h2>
        <p className="mt-2 text-ink">
          We may update this Privacy Policy from time to time. The updated version will be posted on this page with a new last updated date.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Contact Us</h2>
        <p className="mt-2 text-ink">
          Questions about this Privacy Policy can be sent to <a className="font-extrabold text-coral" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </article>
    </SiteShell>
  );
}
