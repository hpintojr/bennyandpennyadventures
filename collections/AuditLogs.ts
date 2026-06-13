import type { CollectionConfig } from "payload";

export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  admin: {
    useAsTitle: "action",
    defaultColumns: ["action", "collectionName", "recordId", "adminUser", "createdAt"]
  },
  fields: [
    { name: "action", type: "text", required: true },
    { name: "collectionName", type: "text" },
    { name: "recordId", type: "text" },
    { name: "adminUser", type: "relationship", relationTo: "users" },
    { name: "notes", type: "textarea" }
  ]
};
