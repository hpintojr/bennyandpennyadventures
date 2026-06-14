import type { Metadata } from "next";
import SiteShell from "../../../components/SiteShell";

export const metadata: Metadata = {
  title: "State Privacy Rights",
  description: "State privacy rights notice for Benny & Penny's Adventures."
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";

const coveredStates = [
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Indiana",
  "Iowa",
  "Kentucky",
  "Maryland",
  "Minnesota",
  "Montana",
  "Nebraska",
  "New Hampshire",
  "New Jersey",
  "Oregon",
  "Rhode Island",
  "Tennessee",
  "Texas",
  "Utah",
  "Virginia"
];

export default function StatePrivacyRightsPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 14, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">State Privacy Rights</h1>

        <p className="mt-4 text-ink">
          Several U.S. states provide privacy rights for residents. Some laws apply only to businesses that meet specific thresholds. Even when a state law does not legally apply to us, we provide a practical request process so customers and website users can ask about, update, or delete information when appropriate.
        </p>

        <h2 className="mt-8 font-serif text-2xl text-teal">States Covered by This Notice</h2>
        <p className="mt-2 text-ink">
          This notice is intended to support residents of states with comprehensive privacy laws, including:
        </p>
        <ul className="mt-3 grid list-disc gap-2 pl-6 text-ink sm:grid-cols-2">
          {coveredStates.map((state) => <li key={state}>{state}</li>)}
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">Rights That May Be Available</h2>
        <p className="mt-2 text-ink">Depending on your state and whether the law applies, you may have rights to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-ink">
          <li>Confirm whether we process your personal information.</li>
          <li>Access personal information we maintain about you.</li>
          <li>Correct inaccurate personal information.</li>
          <li>Delete personal information, subject to legal, tax, security, fraud-prevention, transaction, and recordkeeping exceptions.</li>
          <li>Receive a portable copy of certain personal information.</li>
          <li>Opt out of sale, targeted advertising, or profiling where those activities occur and where the right applies.</li>
          <li>Appeal a denied privacy request where state law provides an appeal right.</li>
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">Our Current Practices</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-ink">
          <li>We do not sell personal information.</li>
          <li>We do not share mobile opt-in data or SMS consent with third parties for their own marketing purposes.</li>
          <li>We do not currently use personal information for targeted advertising or automated profiling decisions.</li>
          <li>We use service providers for website hosting, email delivery, payments, database hosting, digital storage, and fulfillment support.</li>
        </ul>

        <h2 className="mt-8 font-serif text-2xl text-teal">Submit a Request</h2>
        <p className="mt-2 text-ink">
          Submit a request through our <a className="font-extrabold text-coral" href="/privacy/requests">Privacy Requests page</a> or email <a className="font-extrabold text-coral" href={`mailto:${contactEmail}`}>{contactEmail}</a>. Please include your state of residence and the request type so we can route it properly.
        </p>
      </article>
    </SiteShell>
  );
}
