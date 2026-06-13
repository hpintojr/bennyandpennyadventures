import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "orderNumber",
    defaultColumns: ["orderNumber", "customer", "status", "total", "createdAt"]
  },
  fields: [
    { name: "orderNumber", type: "text", required: true, unique: true },
    { name: "customer", type: "relationship", relationTo: "users" },
    { name: "customerEmail", type: "email", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Paid", value: "paid" },
        { label: "Fulfilled", value: "fulfilled" },
        { label: "Refunded", value: "refunded" },
        { label: "Canceled", value: "canceled" }
      ]
    },
    { name: "stripeCheckoutSessionId", type: "text" },
    { name: "stripePaymentIntentId", type: "text" },
    { name: "total", type: "number", required: true, defaultValue: 0 },
    { name: "currency", type: "text", required: true, defaultValue: "usd" },
    { name: "notes", type: "textarea" }
  ]
};
