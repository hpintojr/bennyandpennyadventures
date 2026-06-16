import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

// Hashed, single-use, expiring tokens for account setup + password reset (emailed links).
export const PasswordTokens: CollectionConfig = {
  slug: "password-tokens",
  labels: { singular: "Password Token", plural: "Password Tokens" },
  access: adminOnly,
  admin: {
    hidden: true,
    useAsTitle: "email",
    defaultColumns: ["email", "type", "expiresAt", "usedAt"]
  },
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true },
    { name: "email", type: "text" },
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "setup",
      options: [
        { label: "Account setup", value: "setup" },
        { label: "Password reset", value: "reset" }
      ]
    },
    { name: "tokenHash", type: "text", required: true, index: true },
    { name: "expiresAt", type: "date", required: true },
    { name: "usedAt", type: "date" }
  ]
};
