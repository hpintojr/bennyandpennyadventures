import type { CollectionConfig } from "payload";

export const SupportMessages: CollectionConfig = {
  slug: "support-messages",
  admin: {
    useAsTitle: "messagePreview",
    defaultColumns: ["ticket", "senderType", "createdAt"]
  },
  fields: [
    { name: "ticket", type: "relationship", relationTo: "support-tickets", required: true },
    {
      name: "senderType",
      type: "select",
      required: true,
      options: [
        { label: "Customer", value: "customer" },
        { label: "Admin", value: "admin" }
      ]
    },
    { name: "senderEmail", type: "email" },
    { name: "message", type: "textarea", required: true },
    { name: "messagePreview", type: "text", admin: { description: "Short internal title/preview for the admin list." } }
  ]
};
