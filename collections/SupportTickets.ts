import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

export const SupportTickets: CollectionConfig = {
  slug: "support-tickets",
  access: adminOnly,
  labels: {
    singular: "Support Ticket",
    plural: "Support"
  },
  admin: {
    useAsTitle: "subject",
    description: "Review customer support, download help, order questions, and school or hospital inquiries.",
    defaultColumns: ["subject", "customerEmail", "relatedOrder", "status", "priority"]
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "users" },
    { name: "customerEmail", type: "email", required: true },
    { name: "relatedOrder", type: "relationship", relationTo: "orders" },
    { name: "subject", type: "text", required: true },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "general",
      options: [
        { label: "Order Issue", value: "order" },
        { label: "Download Help", value: "download" },
        { label: "Audiobook Help", value: "audiobook" },
        { label: "Print or Shipping", value: "print-shipping" },
        { label: "Bulk Order", value: "bulk-order" },
        { label: "School or Hospital Inquiry", value: "institutional" },
        { label: "General", value: "general" }
      ]
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "open",
      options: [
        { label: "Open", value: "open" },
        { label: "Pending", value: "pending" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" }
      ]
    },
    {
      name: "priority",
      type: "select",
      defaultValue: "normal",
      options: [
        { label: "Low", value: "low" },
        { label: "Normal", value: "normal" },
        { label: "High", value: "high" }
      ]
    },
    { name: "message", type: "textarea", required: true },
    { name: "adminNotes", type: "textarea" }
  ]
};
