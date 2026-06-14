import type { Metadata } from "next";
import Link from "next/link";
import ClearCartOnSuccess from "@/app/components/ClearCartOnSuccess";
import { fulfillCheckoutSessionById, type FulfillmentSummary } from "@/lib/stripeFulfillment";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "Thank You"
};

type ThankYouPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSearchParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function isNewsletterSignup(searchParams: Record<string, string | string[] | undefined>) {
  const sessionId = getSearchParam(searchParams, "session_id");
  const email = getSearchParam(searchParams, "email");
  return Boolean(email && !sessionId);
}

async function reconcileStripeCheckout(sessionId: string | undefined): Promise<FulfillmentSummary | null> {
  if (!sessionId || !sessionId.startsWith("cs_")) return null;

  try {
    const summary = await fulfillCheckoutSessionById(sessionId);
    console.log("Stripe checkout fulfilled from thank-you fallback", summary);
    return summary;
  } catch (error) {
    console.error("Stripe thank-you fallback fulfillment failed", error);
    return null;
  }
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const sessionId = getSearchParam(resolvedSearchParams, "session_id");
  const newsletterSignup = isNewsletterSignup(resolvedSearchParams);
  const fulfillment = newsletterSignup ? null : await reconcileStripeCheckout(sessionId);

  const orderMessage = fulfillment
    ? fulfillment.created
      ? `Order ${fulfillment.orderNumber} has been created.`
      : `Order ${fulfillment.orderNumber} was already created.`
    : "Your payment was received. Your order will appear in the admin once fulfillment sync finishes.";

  if (newsletterSignup) {
    return (
      <SiteShell>
        <section className="page-wrap flex min-h-[60vh] flex-col items-center justify-center pb-20 pt-10 text-center">
          <h1 className="font-serif text-5xl font-semibold text-teal">You&apos;re Signed Up!</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">
            Thank you for joining Benny &amp; Penny&apos;s Adventures. We&apos;ll send gentle updates, book news, printables, and family-friendly resources to your inbox.
          </p>
          <p className="mx-auto mt-4 max-w-2xl rounded-3xl border border-gold/60 bg-white/80 px-6 py-4 text-sm font-bold text-teal shadow-soft">
            Your newsletter signup was received. You can unsubscribe at any time using the link in future emails.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/books" className="btn">Explore Our Books</Link>
            <Link href="/for-parents" className="btn-ghost">For Parents</Link>
            <Link href="/" className="btn-ghost">Back to Home</Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <ClearCartOnSuccess shouldClear={Boolean(sessionId)} />
      <section className="page-wrap flex min-h-[60vh] flex-col items-center justify-center pb-20 pt-10 text-center">
        <h1 className="font-serif text-5xl font-semibold text-teal">Thank You!</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">Thank you for your Benny &amp; Penny order. We are preparing your purchase details and delivery access.</p>
        <p className="mx-auto mt-4 max-w-2xl rounded-3xl border border-gold/60 bg-white/80 px-6 py-4 text-sm font-bold text-teal shadow-soft">{orderMessage}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/books" className="btn">Explore Our Books</Link>
          <Link href="/" className="btn-ghost">Back to Home</Link>
        </div>
      </section>
    </SiteShell>
  );
}
