import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";
import { deactivatePromotionInStripe, syncPromotionToStripe } from "@/lib/promotions";

export const Promotions: CollectionConfig = {
  slug: "promotions",
  labels: {
    singular: "Promotion",
    plural: "Promotions"
  },
  access: adminOnly,
  admin: {
    useAsTitle: "code",
    description: "Admin discount codes. Synced to Stripe coupons + promotion codes; customers enter them at checkout. (Gift codes are separate and start with BPG.)",
    defaultColumns: ["code", "discountType", "amount", "active", "maxRedemptions", "timesRedeemed", "expiresAt", "syncStatus"]
  },
  hooks: {
    afterChange: [syncPromotionToStripe],
    afterDelete: [deactivatePromotionInStripe]
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "The code customers type at checkout, e.g. WELCOME10. Must NOT start with BPG (reserved for gift codes)." },
      validate: (value: unknown) => {
        const code = typeof value === "string" ? value.trim() : "";
        if (!code) return "A code is required.";
        if (/^BPG/i.test(code)) return "Discount codes cannot start with BPG (that prefix is reserved for gift codes).";
        if (!/^[A-Za-z0-9_-]{3,40}$/.test(code)) return "Use 3–40 letters, numbers, dashes or underscores.";
        return true;
      }
    },
    {
      name: "discountType",
      type: "select",
      required: true,
      defaultValue: "percent",
      options: [
        { label: "Percent off (%)", value: "percent" },
        { label: "Fixed amount off ($)", value: "fixed" }
      ]
    },
    {
      name: "amount",
      type: "number",
      required: true,
      min: 0,
      admin: { description: "For percent: 10 = 10% off. For fixed: 5 = $5.00 off." }
    },
    { name: "currency", type: "text", defaultValue: "usd", admin: { condition: (data) => data?.discountType === "fixed" } },
    { name: "active", type: "checkbox", defaultValue: true },
    { name: "maxRedemptions", type: "number", min: 1, admin: { description: "Optional total redemption cap across all customers." } },
    { name: "timesRedeemed", type: "number", defaultValue: 0, admin: { readOnly: true, description: "Reporting only (sync from Stripe later)." } },
    { name: "expiresAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "notes", type: "textarea" },
    { name: "stripeCouponId", type: "text", admin: { readOnly: true } },
    { name: "stripePromotionCodeId", type: "text", admin: { readOnly: true } },
    { name: "syncStatus", type: "text", admin: { readOnly: true, description: "Stripe sync result." } }
  ]
};
