import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

const yesNoCell = "/app/(payload)/components/BooleanYesNoCell.tsx#BooleanYesNoCell";

export const AbandonedCarts: CollectionConfig = {
  slug: "abandoned-carts",
  labels: { singular: "Abandoned Cart", plural: "Abandoned Carts" },
  access: adminOnly,
  admin: {
    useAsTitle: "email",
    description: "Cart recovery, consent, Sequenzy delivery, coupon attribution, and campaign reporting.",
    defaultColumns: ["email", "marketingConsent", "recoveryEligible", "recoveryState", "status", "itemCount", "subtotal", "itemsSummary", "abandonedAt", "lastReminderSentAt", "recoveredOrderNumber", "recoveredRevenue", "convertedAt"]
  },
  fields: [
    {
      name: "recoveryControls",
      type: "ui",
      admin: {
        components: {
          Field: "/app/(payload)/components/CartRecoveryRecordActions.tsx#CartRecoveryRecordActions"
        }
      }
    },
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
    { name: "itemsSummary", type: "textarea", label: "Items summary", admin: { readOnly: true } },
    { name: "itemCount", type: "number", defaultValue: 0, admin: { readOnly: true } },
    { name: "subtotal", type: "number", defaultValue: 0, admin: { readOnly: true } },
    { name: "requiresShipping", type: "checkbox", defaultValue: false },
    {
      name: "marketingConsent",
      label: "Cart Reminder?",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Whether the guest explicitly opted into cart reminders.", components: { Cell: yesNoCell } }
    },
    {
      name: "recoveryEligible",
      label: "Recovery Eligible?",
      type: "checkbox",
      defaultValue: false,
      admin: { readOnly: true, description: "Email, consent, and subscriber preferences all allow a recovery message.", components: { Cell: yesNoCell } }
    },
    {
      name: "recoveryState",
      label: "Recovery State",
      type: "select",
      defaultValue: "not-eligible",
      admin: { readOnly: true },
      options: [
        { label: "Not eligible", value: "not-eligible" },
        { label: "Eligible", value: "eligible" },
        { label: "Reminder 1 sent", value: "reminder-1-sent" },
        { label: "Reminder 2 sent", value: "reminder-2-sent" },
        { label: "Suppressed", value: "suppressed" },
        { label: "Recovered", value: "recovered" },
        { label: "Converted", value: "converted" }
      ]
    },
    { name: "couponCode", type: "text" },
    { name: "giftCode", type: "text" },
    { name: "bpgCode", type: "text" },
    { name: "stripeCheckoutSessionId", type: "text" },
    { name: "stripeCustomerId", type: "text" },
    { name: "firstSeenAt", type: "date" },
    { name: "lastActivityAt", type: "date" },
    { name: "checkoutStartedAt", type: "date" },
    { name: "abandonedAt", type: "date", admin: { readOnly: true } },
    { name: "firstReminderSentAt", type: "date", admin: { readOnly: true } },
    { name: "secondReminderSentAt", type: "date", admin: { readOnly: true } },
    { name: "lastReminderSentAt", type: "date", admin: { readOnly: true } },
    { name: "recoveryEmailError", type: "text", admin: { readOnly: true } },
    { name: "recoveredOrderNumber", type: "text", admin: { readOnly: true } },
    { name: "recoveredRevenue", type: "number", admin: { readOnly: true } },
    { name: "convertedAt", type: "date" },
    { name: "recoveredAt", type: "date", admin: { readOnly: true } },
    { name: "lastSequenzySyncAt", type: "date", admin: { readOnly: true } },
    { name: "sequenzyTags", type: "json", admin: { readOnly: true } },
    { name: "source", type: "text" },
    { name: "metadata", type: "json" },
    { name: "adminNotes", type: "textarea" }
  ]
};
