import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { getStripe } from "@/lib/stripe";

type PromotionDoc = {
  id: string | number;
  code?: string;
  discountType?: "percent" | "fixed";
  amount?: number;
  currency?: string;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  active?: boolean;
  stripeCouponId?: string | null;
  stripePromotionCodeId?: string | null;
  syncStatus?: string | null;
  notes?: string | null;
};

function toUnixSeconds(value?: string | null) {
  if (!value) return undefined;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? Math.floor(t / 1000) : undefined;
}

// Creates the Stripe Coupon + Promotion Code the first time a promotion is saved,
// then writes the Stripe ids back. On later edits it keeps the promo code's active
// flag in sync. Runs server-side only; failures are recorded, never thrown, so an
// admin save never hard-fails.
export const syncPromotionToStripe: CollectionAfterChangeHook = async ({ doc, req, operation, context }) => {
  const promotion = doc as PromotionDoc;

  // Avoid recursion when we write the ids back below.
  if ((context as { skipStripeSync?: boolean })?.skipStripeSync) return doc;
  if (!process.env.STRIPE_SECRET_KEY) return doc;

  const code = (promotion.code || "").trim();
  if (!code) return doc;

  try {
    const stripe = getStripe();

    // First sync: create coupon + promotion code.
    if (!promotion.stripeCouponId || !promotion.stripePromotionCodeId) {
      const amount = Number(promotion.amount) || 0;
      const coupon = await stripe.coupons.create(
        promotion.discountType === "fixed"
          ? { amount_off: Math.round(amount * 100), currency: (promotion.currency || "usd").toLowerCase(), duration: "once", name: code }
          : { percent_off: amount, duration: "once", name: code }
      );

      const promo = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code,
        active: promotion.active !== false,
        ...(promotion.maxRedemptions ? { max_redemptions: Number(promotion.maxRedemptions) } : {}),
        ...(toUnixSeconds(promotion.expiresAt) ? { expires_at: toUnixSeconds(promotion.expiresAt) } : {})
      });

      await req.payload.update({
        collection: "promotions",
        id: promotion.id,
        data: { stripeCouponId: coupon.id, stripePromotionCodeId: promo.id, syncStatus: "synced" },
        context: { skipStripeSync: true },
        overrideAccess: true
      });
      return doc;
    }

    // Subsequent edits: keep the active flag aligned (coupon amount/code are immutable in Stripe).
    if (operation === "update" && promotion.stripePromotionCodeId) {
      await stripe.promotionCodes.update(promotion.stripePromotionCodeId, { active: promotion.active !== false });
    }
  } catch (error) {
    console.error("Stripe promotion sync failed", { code, error });
    try {
      await req.payload.update({
        collection: "promotions",
        id: promotion.id,
        data: { syncStatus: `error: ${error instanceof Error ? error.message : "unknown"}`.slice(0, 250) },
        context: { skipStripeSync: true },
        overrideAccess: true
      });
    } catch {
      // ignore secondary failure
    }
  }

  return doc;
};

// When a promotion is deleted, deactivate its Stripe promotion code so it can no
// longer be redeemed. (Stripe promotion codes can't be deleted, only deactivated.)
export const deactivatePromotionInStripe: CollectionAfterDeleteHook = async ({ doc }) => {
  const promotion = doc as PromotionDoc;
  if (!process.env.STRIPE_SECRET_KEY || !promotion.stripePromotionCodeId) return doc;
  try {
    const stripe = getStripe();
    await stripe.promotionCodes.update(promotion.stripePromotionCodeId, { active: false });
  } catch (error) {
    console.error("Stripe promotion deactivation failed", { id: promotion.id, error });
  }
  return doc;
};
