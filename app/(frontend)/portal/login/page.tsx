import type { Metadata } from "next";
import PortalLoginForm from "../../../components/PortalLoginForm";

export const metadata: Metadata = {
  title: "Customer Login"
};

export default function PortalLoginPage() {
  return (
    <section className="wrap pb-20 pt-10 text-center">
      <p className="font-serif text-2xl italic text-coral">Welcome Back ♥</p>
      <h1 className="mx-auto mt-2 max-w-3xl font-serif text-[42px] font-bold leading-tight text-teal sm:text-6xl">Customer Portal</h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
        Use the email connected to your Benny &amp; Penny account. New here or forgot your password? Use the links below.
      </p>
      <PortalLoginForm />
    </section>
  );
}
