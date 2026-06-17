import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

export const PrintJobs: CollectionConfig = {
  slug: "print-jobs",
  access: adminOnly,
  labels: {
    singular: "Print Job",
    plural: "Print Jobs"
  },
  admin: {
    useAsTitle: "title",
    description: "Internal LuLu print-on-demand queue for paperback and hardcover fulfillment.",
    defaultColumns: ["title", "order", "book", "format", "quantity", "status", "provider", "luluPrintJobId", "createdAt"]
  },
  fields: [
    { name: "title", type: "text", required: true, admin: { description: "Readable job title generated from the order and item." } },
    { name: "order", type: "relationship", relationTo: "orders", required: true },
    { name: "orderItem", type: "relationship", relationTo: "order-items", label: "Order detail" },
    { name: "book", type: "relationship", relationTo: "books" },
    {
      name: "provider",
      type: "select",
      required: true,
      defaultValue: "lulu",
      options: [{ label: "LuLu", value: "lulu" }]
    },
    {
      name: "format",
      type: "select",
      required: true,
      options: [
        { label: "Paperback", value: "paperback" },
        { label: "Hardcover", value: "hardcover" }
      ]
    },
    { name: "quantity", type: "number", required: true, defaultValue: 1 },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Ready", value: "ready" },
        { label: "Submitted", value: "submitted" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
        { label: "Shipped", value: "shipped" },
        { label: "Delivered", value: "delivered" },
        { label: "Canceled", value: "canceled" },
        { label: "Error", value: "error" }
      ]
    },
    { name: "customerName", type: "text", label: "Customer name" },
    { name: "customerEmail", type: "email", label: "Customer email" },
    { name: "shippingName", type: "text", label: "Shipping name" },
    { name: "shippingLine1", type: "text", label: "Shipping address line 1" },
    { name: "shippingLine2", type: "text", label: "Shipping address line 2" },
    { name: "shippingCity", type: "text", label: "Shipping city" },
    { name: "shippingState", type: "text", label: "Shipping state" },
    { name: "shippingPostalCode", type: "text", label: "Shipping postal code" },
    { name: "shippingCountry", type: "text", label: "Shipping country" },
    { name: "luluPrintJobId", type: "text", label: "LuLu print job ID" },
    { name: "luluLineItemId", type: "text", label: "LuLu line item ID" },
    { name: "trackingNumber", type: "text", label: "Tracking number" },
    { name: "trackingUrl", type: "text", label: "Tracking URL" },
    { name: "rawRequest", type: "textarea", label: "Raw LuLu request" },
    { name: "rawResponse", type: "textarea", label: "Raw LuLu response" },
    { name: "errorMessage", type: "textarea", label: "Error message" },
    { name: "submittedAt", type: "date", label: "Submitted at" },
    { name: "acceptedAt", type: "date", label: "Accepted at" },
    { name: "shippedAt", type: "date", label: "Shipped at" },
    { name: "deliveredAt", type: "date", label: "Delivered at" },
    { name: "notes", type: "textarea" }
  ]
};
