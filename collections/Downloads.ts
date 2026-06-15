import type { CollectionConfig } from "payload";
import { isAdmin, isAdminOrSelf } from "@/lib/access";

export const Downloads: CollectionConfig = {
  slug: "downloads",
  access: {
    read: isAdminOrSelf("customer"),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin
  },
  labels: {
    singular: "Media",
    plural: "Media"
  },
  admin: {
    useAsTitle: "fileLabel",
    description: "Manage digital download records, audiobook files, R2 object keys, access limits, and expiration windows.",
    defaultColumns: ["fileLabel", "customer", "format", "downloadsUsed", "maxDownloads", "accessExpiresAt", "isActive"]
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
