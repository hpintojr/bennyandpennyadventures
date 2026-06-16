import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import EmailLinkRequestClient from "../../components/EmailLinkRequestClient";

export const metadata: Metadata = { title: "Create an Account" };

export default function RegisterPage() {
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10 text-center">
        <p className="font-serif text-2xl italic text-coral">Join us ♥</p>
        <h1 className="mt-2 font-serif text-[40px] font-bold leading-tight text-teal sm:text-5xl">Create an Account</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">No purchase needed. Enter your email and we&apos;ll send a link to set your password.</p>
      </section>
      <section className="wrap pb-20">
        <EmailLinkRequestClient
          endpoint="/api/auth/register"
          withName
          buttonLabel="Send me a setup link"
          successTitle="Check your email ♥"
          successText="If that email can be set up, we just sent a link to create your password."
        />
      </section>
    </SiteShell>
  );
}
