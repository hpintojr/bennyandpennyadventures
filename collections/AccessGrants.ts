import type { CollectionConfig } from "payload";

export const AccessGrants: CollectionConfig = {
  slug: "access-grants",
  admin: {
    useAsTitle: "reason",
    defaultColumns: ["customer", "book", "format", "reason", "expiresAt"]
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "users", required: true },
    { name: "book", type: "relationship", relationTo: "books", required: true },
    {
      name: "format",
      type: "select",
      required: true,
      options: [
        { label: "PDF / EPUB", value: "digital" },
        { label: "Audiobook", value: "audiobook" },
        { label: "Full Bundle", value: "bundle" }
      ]
    },
    { name: "maxDownloads", type: "number", defaultValue: 3 },
    { name: "expiresAt", type: "date" },
    { name: "reason", type: "text", required: true },
    { name: "adminNotes", type: "textarea" }
  ]
};
