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
    description: "Manage digital file records, audiobook files, R2 object keys, shared readable-license limits, and expiration windows.",
    defaultColumns: ["fileLabel", "customer", "format", "downloadsUsed", "maxDownloads", "giftsIssued", "accessExpiresAt", "isActive"]
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
    { name: "maxDownloads", type: "number", required: true, defaultValue: 3, admin: { description: "For PDF/EPUB, this is the shared readable-license slot pool for the title, not a separate limit per file format." } },
    { name: "downloadsUsed", type: "number", required: true, defaultValue: 0, admin: { description: "Counts downloads for this specific file record. PDF and EPUB are summed together at runtime for the shared readable-license pool." } },
    { name: "giftsIssued", type: "number", required: true, defaultValue: 0, admin: { description: "Gift slots spent from this title license. PDF and EPUB gift/download usage is summed together for the readable pool." } },
    { name: "accessExpiresAt", type: "date" },
    { name: "lastDownloadedAt", type: "date" },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "adminNotes", type: "textarea" }
  ]
};
