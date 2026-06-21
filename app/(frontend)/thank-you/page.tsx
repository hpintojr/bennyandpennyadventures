import type { Metadata } from "next";
import Link from "next/link";
import ClearCartOnSuccess from "@/app/components/ClearCartOnSuccess";
import { fulfillCheckoutSessionById, type FulfillmentSummary } from "@/lib/stripeFulfillment";
import SiteShell from "../../components/SiteShell";
import SetPasswordCard from "@/app/components/SetPasswordCard";

export const metadata: Metadata = { title: "Thank You" };

type ThankYouPageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

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

function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function getCheckoutReference(sessionId: string | undefined) {
  if (!sessionId || !sessionId.startsWith("cs_")) return null;
  const compact = sessionId.replace(/^cs_(test|live)_/, "");
  return compact.slice(-10).toUpperCase();
}

async function reconcileStripeCheckout(sessionId: string | undefined): Promise<FulfillmentSummary | null> {
  if (!sessionId || !sessionId.startsWith("cs_")) return null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const summary = await fulfillCheckoutSessionById(sessionId);
      console.log("Stripe checkout fulfilled from thank-you fallback", { attempt, ...summary });
      return summary;
    } catch (error) {
      console.error("Stripe thank-you fallback fulfillment failed", { attempt, error });
      if (attempt < 3) await sleep(1200);
    }
  }
  return null;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const sessionId = getSearchParam(resolvedSearchParams, "session_id");
  const newsletterSignup = isNewsletterSignup(resolvedSearchParams);
  const fulfillment = newsletterSignup ? null : await reconcileStripeCheckout(sessionId);
  const checkoutReference = getCheckoutReference(sessionId);
  const orderMessage = fulfillment ? fulfillment.created ? `Order #${fulfillment.orderNumber} has been created.` : `Order #${fulfillment.orderNumber} has been confirmed.` : checkoutReference ? `Your payment was received. Confirmation reference: ${checkoutReference}. Your order number will appear in the admin once fulfillment sync finishes.` : "Your payment was received. Your order will appear in the admin once fulfillment sync finishes.";

  if (newsletterSignup) {
    return <SiteShell><section className="page-wrap flex min-h-[60vh] flex-col items-center justify-center pb-20 pt-10 text-center"><h1 className="font-serif text-5xl font-semibold text-teal">You&apos;re Signed Up!</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">Thank you for joining Benny &amp; Penny Adventures. We&apos;ll send gentle updates, book news, printables, and family-friendly resources to your inbox.</p><p className="mx-auto mt-4 max-w-2xl rounded-3xl border border-gold/60 bg-white/80 px-6 py-4 text-sm font-bold text-teal shadow-soft">Your newsletter signup was received. You can unsubscribe at any time using the link in future emails.</p><div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/books" className="btn">Explore Our Books</Link><Link href="/for-parents" className="btn-ghost">For Parents</Link><Link href="/" className="btn-ghost">Back to Home</Link></div></section></SiteShell>;
  }

  return <SiteShell><ClearCartOnSuccess shouldClear={Boolean(sessionId)} /><section className="page-wrap flex min-h-[60vh] flex-col items-center justify-center pb-20 pt-10 text-center"><h1 className="font-serif text-5xl font-semibold text-teal">Thank You!</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-ink">Thank you for your Benny &amp; Penny order. We are preparing your purchase details and delivery access.</p><p className="mx-auto mt-4 max-w-2xl rounded-3xl border border-gold/60 bg-white/80 px-6 py-4 text-sm font-bold text-teal shadow-soft">{orderMessage}</p>{sessionId ? <SetPasswordCard sessionId={sessionId} /> : null}<div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/books" className="btn">Explore Our Books</Link><Link href="/" className="btn-ghost">Back to Home</Link></div></section></SiteShell>;
}
