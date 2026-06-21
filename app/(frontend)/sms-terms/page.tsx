import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Messaging Terms",
  description: "SMS and messaging terms for Benny & Penny Adventures."
};

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";
const businessName = "Benny & Penny Adventures";

export default function SmsTermsPage() {
  return (
    <SiteShell>
      <article className="page-wrap max-w-3xl pb-16 pt-6">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Last updated: June 14, 2026</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-teal">Messaging Terms</h1>
        <p className="mt-4 text-ink">These Messaging Terms apply when you choose to receive SMS/text messages from {businessName}. SMS consent is optional and is not required to buy books, downloads, audiobooks, or other products.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Program Description</h2>
        <p className="mt-2 text-ink">If you opt in, we may send messages about your inquiry, orders, downloads, customer support, account access, product updates, book releases, resources, and related updates from {businessName}.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Consent</h2>
        <p className="mt-2 text-ink">By checking an SMS opt-in box or otherwise affirmatively opting in, you agree to receive text messages from {businessName} at the phone number you provide. Consent is not a condition of purchase.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Message Frequency and Costs</h2>
        <p className="mt-2 text-ink">Message frequency varies based on your interaction with us. Message and data rates may apply. Your mobile carrier is not responsible for delayed or undelivered messages.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Opt Out and Help</h2>
        <p className="mt-2 text-ink">You may opt out of SMS messages at any time by replying STOP. You may request help by replying HELP or contacting us at <a className="font-extrabold text-coral" href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
        <h2 className="mt-8 font-serif text-2xl text-teal">Privacy</h2>
        <p className="mt-2 text-ink">We do not sell personal information. We do not share mobile opt-in data or SMS consent with third parties for their own marketing purposes. See our <a className="font-extrabold text-coral" href="/privacy">Privacy Policy</a> for more information.</p>
      </article>
    </SiteShell>
  );
}
