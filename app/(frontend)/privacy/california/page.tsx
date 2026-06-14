import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";

export const metadata: Metadata = {
  title: "California Privacy Notice",
  description: "California privacy notice for Benny & Penny's Adventures."
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";

const categories = [
  {
    category: "Identifiers",
    examples: "Name, email address, phone number, shipping or billing address, account identifiers, IP address.",
    source: "You, checkout providers, website forms, account activity.",
    purpose: "Respond to inquiries, process orders, provide downloads, customer support, security, records."
  },
  {
    category: "Commercial information",
    examples: "Products purchased, order totals, payment status, download/access records.",
    source: "Stripe, Payload CMS, website checkout, fulfillment tools.",
    purpose: "Process purchases, fulfill digital/audio/print products, support customers, prevent misuse."
  },
  {
    category: "Internet or technical information",
    examples: "IP address, browser/user-agent, consent timestamp, basic site activity.",
    source: "Website forms, server logs, analytics or security tools if enabled.",
    purpose: "Security, form consent proof, troubleshooting, website improvement."
  },
  {
    category: "Audio/download interaction records",
    examples: "File type, download count, access status, signed-link expiration, playback/download support details.",
    source: "Website, digital fulfillment tools, storage providers.",
    purpose: "Provide purchased content and protect paid products."
  },
  {
    category: "Sensitive personal information, if provided",
    examples: "Contents of messages sent to us and account-login information if a customer portal is used.",
    source: "You and our website/account systems.",
    purpose: "Respond to your request, provide account access, security, and customer support."
  }
];

export default function CaliforniaPrivacyNoticePage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-4xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 14, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">California Privacy Notice</h1>

        <p className="mt-4 text-ink">
          This California Privacy Notice supplements our <a className="font-extrabold text-coral" href="/privacy">Privacy Policy</a>. It is intended to describe how Benny &amp; Penny&rsquo;s Adventures handles personal information for California residents. Some California privacy rights apply only when a business is legally subject to the CCPA/CPRA thresholds, but we provide request options to help users control their information.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Categories of Personal Information</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-tan bg-white">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm text-ink">
            <thead className="bg-green text-teal">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Examples</th>
                <th className="p-3">Sources</th>
                <th className="p-3">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((row) => (
                <tr className="border-t border-tan" key={row.category}>
                  <td className="p-3 font-extrabold text-teal">{row.category}</td>
                  <td className="p-3">{row.examples}</td>
                  <td className="p-3">{row.source}</td>
                  <td className="p-3">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-8 font-serif text-2xl text-teal">Sale, Sharing, and SMS Consent</h2>
        <p className="mt-2 text-ink">
          We do not sell personal information. We do not share personal information for cross-context behavioral advertising unless a future advertising tool is added and this notice is updated. We do not share mobile opt-in data or SMS consent with third parties for their own marketing purposes.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">California Rights</h2>
        <p className="mt-2 text-ink">
          Depending on applicability and verification, California residents may request to know/access personal information, request deletion, request correction, opt out of sale or sharing, limit use of sensitive personal information, and exercise privacy rights without discrimination.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">How to Submit a Request</h2>
        <p className="mt-2 text-ink">
          Submit privacy requests through our <a className="font-extrabold text-coral" href="/privacy/requests">Privacy Requests page</a> or email us at <a className="font-extrabold text-coral" href={`mailto:${contactEmail}`}>{contactEmail}</a>. We may need information to verify your identity before completing access, correction, or deletion requests.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Retention</h2>
        <p className="mt-2 text-ink">
          We retain information for as long as needed to provide products and services, maintain purchase and tax/accounting records, protect digital products, respond to support inquiries, maintain consent records, comply with legal obligations, and resolve disputes.
        </p>
      </article>
    </SiteShell>
  );
}
