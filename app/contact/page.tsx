import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";
import NewsletterForm from "../components/NewsletterForm";
import SocialLinks from "../components/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Benny & Penny's Adventures for questions, school visits, press, media, and bulk orders."
};

const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com";

export default function ContactPage() {
  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-4">
        <section className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">Contact Us <span className="text-coral">♥</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink">Questions, school visits, press, or bulk orders — we&rsquo;d love to hear from you. We read every message and reply as soon as we can.</p>
        </section>

        <section className="grid items-start gap-7 py-10 lg:grid-cols-[1.3fr_0.9fr]">
          <form className="panel-card rounded-3xl p-6" action={`mailto:${email}`} method="post" encType="text/plain">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-extrabold text-teal">Name<input name="name" type="text" placeholder="Your name" className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral" /></label>
              <label className="text-sm font-extrabold text-teal">Email<input name="email" type="email" placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral" /></label>
            </div>
            <label className="mt-4 block text-sm font-extrabold text-teal">What&rsquo;s this about?
              <select name="inquiryType" className="mt-2 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral">
                <option>General question</option>
                <option>School / library visit</option>
                <option>Press & media inquiry</option>
                <option>Bulk / wholesale order</option>
                <option>Something else</option>
              </select>
            </label>
            <label className="mt-4 block text-sm font-extrabold text-teal">Message<textarea name="message" placeholder="How can we help?" className="mt-2 min-h-36 w-full rounded-xl border border-tan bg-white px-4 py-3 font-normal text-ink outline-none focus:border-coral" /></label>
            <button className="btn mt-5" type="submit">Send Message ♥</button>
            <p className="mt-3 text-xs text-[#6b7d80]">This opens the visitor&rsquo;s email app for now. Replace this with a backend form action when Mailjet or another provider is connected.</p>
          </form>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-tan bg-blush p-6">
              <h2 className="font-serif text-2xl text-teal">Reach Us Directly</h2>
              <p className="mt-2 text-sm text-ink">Prefer email? Write to us anytime:</p>
              <a className="mt-2 inline-block font-extrabold text-coral" href={`mailto:${email}`}>{email}</a>
              <p className="mt-5 font-extrabold text-teal">Follow the adventures</p>
              <SocialLinks />
            </div>
            <div className="rounded-3xl border border-tan bg-green p-6">
              <h2 className="font-serif text-2xl text-teal">Join the Newsletter</h2>
              <p className="mt-2 text-sm text-ink">Get book release updates, printables, and gentle medical-prep resources.</p>
              <NewsletterForm compact />
            </div>
          </aside>
        </section>
      </div>
    </SiteShell>
  );
}
