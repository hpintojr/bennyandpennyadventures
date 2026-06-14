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

function getSessionId(searchParams: Record<string, string | string[] | undefined>) {
  const value = searchParams.session_id;
  if (Array.isArray(value)) return value[0];
  return value;
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
  const sessionId = getSessionId(resolvedSearchParams);
  const fulfillment = await reconcileStripeCheckout(sessionId);
  const orderMessage = fulfillment
    ? fulfillment.created
      ? `Order ${fulfillment.orderNumber} has been created.`
      : `Order ${fulfillment.orderNumber} was already created.`
    : "Your payment was received. Your order will appear in the admin once fulfillment sync finishes.";

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
