import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";

export const metadata: Metadata = {
  title: "Privacy Requests",
  description: "Submit privacy, opt-out, and Do Not Sell or Share requests for Benny & Penny's Adventures."
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";

export default function PrivacyRequestsPage() {
  const subject = encodeURIComponent("Privacy Request / Do Not Sell or Share Request");
  const body = encodeURIComponent([
    "Privacy request type:",
    "State of residence:",
    "Name:",
    "Email used on the site:",
    "Phone number, if relevant:",
    "Details:",
    "",
    "Please do not include sensitive medical, financial, or government ID information in this email."
  ].join("\n"));

  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 14, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">Privacy Requests</h1>

        <p className="mt-4 text-ink">
          Use this page to submit privacy requests, opt-out requests, correction requests, deletion requests, and Do Not Sell or Share requests.
        </p>

        <div className="mt-6 rounded-3xl border border-tan bg-green p-6">
          <h2 className="font-serif text-2xl text-teal">Current Sale/Sharing Status</h2>
          <p className="mt-2 text-ink">
            Benny &amp; Penny&rsquo;s Adventures does not sell personal information. We do not share personal information for cross-context behavioral advertising unless a future advertising tool is added and our policy is updated. We do not share mobile opt-in data or SMS consent with third parties for their own marketing purposes.
          </p>
        </div>

        <h2 className="mt-8 font-serif text-2xl text-teal">Request Types</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-ink">
          <li>Access / know what personal information we maintain.</li>
          <li>Correct inaccurate personal information.</li>
          <li>Delete personal information, subject to transaction, tax, fraud-prevention, security, legal, and recordkeeping exceptions.</li>
          <li>Opt out of sale or sharing if those activities ever apply.</li>
          <li>Limit use of sensitive personal information where applicable.</li>
          <li>Opt out of marketing email or SMS messages.</li>
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">How to Submit</h2>
        <p className="mt-2 text-ink">
          Email your request to <a className="font-extrabold text-coral" href={`mailto:${contactEmail}?subject=${subject}&body=${body}`}>{contactEmail}</a>. Include your state of residence, the email address or phone number you used with us, and the request type.
        </p>
        <p className="mt-3 text-ink">
          We may ask for information needed to verify your identity. Verification information is used only to process your request. Please do not send sensitive medical, financial, or government ID information unless we specifically request it through a secure process.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">Timing</h2>
        <p className="mt-2 text-ink">
          We will respond within the timeframe required by applicable law when a state privacy law applies. If no specific law applies, we will still try to respond promptly and reasonably.
        </p>
      </article>
    </SiteShell>
  );
}
