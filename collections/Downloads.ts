import type { CollectionConfig } from "payload";

export const Downloads: CollectionConfig = {
  slug: "downloads",
  admin: {
    useAsTitle: "fileLabel",
    defaultColumns: ["fileLabel", "customer", "format", "downloadsUsed", "maxDownloads", "accessExpiresAt"]
  },
  fields: [
    { name: "customer", type: "relationship", relationTo: "users", required: true },
    { name: "order", type: "relationship", relationTo: "orders" },
    { name: "book", type: "relationship", relationTo: "books", required: true },
    { name: "fileLabel", type: "text", required: true },
    {
      name: "format",
      type: "select",
      required: true,
      options: [
        { label: "PDF", value: "pdf" },
        { label: "EPUB", value: "epub" },
        { label: "Audiobook", value: "audiobook" }
      ]
    },
    { name: "r2ObjectKey", type: "text", required: true },
    { name: "maxDownloads", type: "number", required: true, defaultValue: 3 },
    { name: "downloadsUsed", type: "number", required: true, defaultValue: 0 },
    { name: "accessExpiresAt", type: "date" },
    { name: "lastDownloadedAt", type: "date" },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "adminNotes", type: "textarea" }
  ]
};
