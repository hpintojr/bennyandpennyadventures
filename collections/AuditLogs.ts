import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  access: adminOnly,
  admin: {
    hidden: true,
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
