import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  labels: {
    singular: "Order",
    plural: "Orders"
  },
  admin: {
    useAsTitle: "orderNumber",
    description: "Review checkout orders, customer purchase data, addresses, taxes, and fulfillment progress.",
    defaultColumns: ["orderNumber", "customerName", "customerEmail", "itemsSummary", "status", "total", "createdAt"],
    defaultSort: "-createdAt"
  },
  fields: [
    { name: "orderNumber", type: "text", required: true, unique: true },
    { name: "customer", type: "relationship", relationTo: "users" },
    { name: "customerName", type: "text", label: "Customer name" },
    { name: "customerEmail", type: "email", required: true, label: "Customer email" },
    { name: "customerPhone", type: "text", label: "Customer phone" },
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
    { name: "stripeCheckoutSessionId", type: "text", label: "Stripe checkout session ID" },
    { name: "stripePaymentIntentId", type: "text", label: "Stripe payment intent ID" },
    { name: "stripeCustomerId", type: "text", label: "Stripe customer ID" },
    { name: "subtotal", type: "number", required: true, defaultValue: 0 },
    { name: "taxTotal", type: "number", required: true, defaultValue: 0, label: "Tax total" },
    { name: "shippingTotal", type: "number", required: true, defaultValue: 0, label: "Shipping total" },
    { name: "discountTotal", type: "number", required: true, defaultValue: 0, label: "Discount total" },
    { name: "total", type: "number", required: true, defaultValue: 0 },
    { name: "currency", type: "text", required: true, defaultValue: "usd" },
    { name: "itemCount", type: "number", required: true, defaultValue: 0, label: "Item count" },
    { name: "itemsSummary", type: "textarea", label: "Purchased items summary" },
    { name: "billingAddressName", type: "text", label: "Billing name" },
    { name: "billingAddressLine1", type: "text", label: "Billing address line 1" },
    { name: "billingAddressLine2", type: "text", label: "Billing address line 2" },
    { name: "billingAddressCity", type: "text", label: "Billing city" },
    { name: "billingAddressState", type: "text", label: "Billing state" },
    { name: "billingAddressPostalCode", type: "text", label: "Billing postal code" },
    { name: "billingAddressCountry", type: "text", label: "Billing country" },
    { name: "shippingAddressName", type: "text", label: "Shipping name" },
    { name: "shippingAddressLine1", type: "text", label: "Shipping address line 1" },
    { name: "shippingAddressLine2", type: "text", label: "Shipping address line 2" },
    { name: "shippingAddressCity", type: "text", label: "Shipping city" },
    { name: "shippingAddressState", type: "text", label: "Shipping state" },
    { name: "shippingAddressPostalCode", type: "text", label: "Shipping postal code" },
    { name: "shippingAddressCountry", type: "text", label: "Shipping country" },
    { name: "notes", type: "textarea" }
  ]
};