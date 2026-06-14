import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: {
    singular: "Order",
    plural: "Orders"
  },
  admin: {
    useAsTitle: "orderNumber",
    description: "Review Stripe checkout orders, customer details, payment status, and fulfillment progress.",
    defaultColumns: ["orderNumber", "customerEmail", "status", "total", "taxTotal", "createdAt"]
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
    { name: "stripeCustomerId", type: "text" },
    { name: "stripePaymentIntentId", type: "text" },
    { name: "total", type: "number", required: true, defaultValue: 0 },
    { name: "subtotal", type: "number", defaultValue: 0 },
    { name: "taxTotal", type: "number", defaultValue: 0 },
    { name: "shippingTotal", type: "number", defaultValue: 0 },
    { name: "currency", type: "text", required: true, defaultValue: "usd" },
    {
      name: "billingAddress",
      type: "group",
      fields: [
        { name: "name", type: "text" },
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "city", type: "text" },
        { name: "state", type: "text" },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text" }
      ]
    },
    {
      name: "shippingAddress",
      type: "group",
      fields: [
        { name: "name", type: "text" },
        { name: "line1", type: "text" },
        { name: "line2", type: "text" },
        { name: "city", type: "text" },
        { name: "state", type: "text" },
        { name: "postalCode", type: "text" },
        { name: "country", type: "text" }
      ]
    },
    { name: "notes", type: "textarea" }
  ]
};
