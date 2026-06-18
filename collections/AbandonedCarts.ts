import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

export const AbandonedCarts: CollectionConfig = {
  slug: "abandoned-carts",
  labels: { singular: "Abandoned Cart", plural: "Abandoned Carts" },
  access: adminOnly,
  admin: {
    useAsTitle: "email",
    description: "Cart and checkout intent tracking for recovery, Sequenzy sync, coupon attribution, and campaign reporting.",
    defaultColumns: ["email", "status", "itemCount", "subtotal", "lastActivityAt", "checkoutStartedAt", "convertedAt"]
  },
  fields: [
    { name: "email", type: "email" },
    { name: "customer", type: "relationship", relationTo: "users" },
    { name: "subscriber", type: "relationship", relationTo: "subscribers" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active-cart",
      options: [
        { label: "Active Cart", value: "active-cart" },
        { label: "Checkout Started", value: "checkout-started" },
        { label: "Abandoned", value: "abandoned" },
        { label: "Converted", value: "converted" },
        { label: "Recovered", value: "recovered" },
        { label: "Dismissed", value: "dismissed" }
      ]
    },
    { name: "cartToken", type: "text", required: true, unique: true },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "slug", type: "text" },
        { name: "title", type: "text" },
        { name: "format", type: "text" },
        { name: "qty", type: "number", defaultValue: 1, min: 0 },
        { name: "unitPrice", type: "number", min: 0 },
        { name: "coverImage", type: "text" }
      ]
    },
    { name: "itemCount", type: "number", defaultValue: 0, admin: { readOnly: true } },
    { name: "subtotal", type: "number", defaultValue: 0, admin: { readOnly: true } },
    { name: "requiresShipping", type: "checkbox", defaultValue: false },
    { name: "marketingConsent", type: "checkbox", defaultValue: false },
    { name: "couponCode", type: "text" },
    { name: "giftCode", type: "text" },
    { name: "bpgCode", type: "text" },
    { name: "stripeCheckoutSessionId", type: "text" },
    { name: "stripeCustomerId", type: "text" },
    { name: "firstSeenAt", type: "date" },
    { name: "lastActivityAt", type: "date" },
    { name: "checkoutStartedAt", type: "date" },
    { name: "convertedAt", type: "date" },
    { name: "abandonedAt", type: "date" },
    { name: "recoveredAt", type: "date" },
    { name: "lastSequenzySyncAt", type: "date", admin: { readOnly: true } },
    { name: "sequenzyTags", type: "json", admin: { readOnly: true } },
    { name: "source", type: "text" },
    { name: "metadata", type: "json" },
    { name: "adminNotes", type: "textarea" }
  ]
};
