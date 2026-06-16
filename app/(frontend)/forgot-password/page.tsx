import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import EmailLinkRequestClient from "../../components/EmailLinkRequestClient";

export const metadata: Metadata = { title: "Reset Your Password" };

export default function ForgotPasswordPage() {
  return (
    <SiteShell>
      <section className="wrap pb-8 pt-10 text-center">
        <p className="font-serif text-2xl italic text-coral">No worries ♥</p>
        <h1 className="mt-2 font-serif text-[40px] font-bold leading-tight text-teal sm:text-5xl">Reset Your Password</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">Enter your account email and we'll send you a link to choose a new password.</p>
      </section>
      <section className="wrap pb-20">
        <EmailLinkRequestClient
          endpoint="/api/auth/forgot-password"
          buttonLabel="Email me a reset link"
          successTitle="Check your email ♥"
          successText="If an account exists for that email, we just sent a reset link."
        />
      </section>
    </SiteShell>
  );
}
