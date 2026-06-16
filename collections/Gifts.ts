import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";
import { generateGiftCode, normalizeGiftCode } from "@/lib/gifts";

export const Gifts: CollectionConfig = {
  slug: "gifts",
  labels: { singular: "Gift", plural: "Gifts" },
  access: adminOnly,
  admin: {
    useAsTitle: "redemptionCode",
    description: "Gift codes (BPG…) a customer or admin issues from a licensed download. One redemption, one download, per code.",
    defaultColumns: ["redemptionCode", "status", "gifter", "recipientEmail", "format", "expiresAt", "redeemedBy", "redeemedAt"]
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        // Auto-generate a BPG code if none provided; normalize custom codes to start with BPG.
        if (!data.redemptionCode || `${data.redemptionCode}`.trim() === "") {
          data.redemptionCode = generateGiftCode();
        } else {
          data.redemptionCode = normalizeGiftCode(`${data.redemptionCode}`);
        }
        return data;
      }
    ]
  },
  fields: [
    { name: "redemptionCode", type: "text", required: true, unique: true, admin: { description: "BPG + 2–5 digits. Leave blank to auto-generate; custom codes are normalized to start with BPG." } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "sent",
      options: [
        { label: "Sent", value: "sent" },
        { label: "Redeemed", value: "redeemed" },
        { label: "Revoked", value: "revoked" },
        { label: "Expired", value: "expired" }
      ]
    },
    { name: "gifter", type: "relationship", relationTo: "users", admin: { description: "The customer who gifted (blank for admin-issued codes)." } },
    { name: "sourceDownload", type: "relationship", relationTo: "downloads", admin: { description: "The license/download the gift slot was spent from." } },
    { name: "sourceBook", type: "relationship", relationTo: "books" },
    {
      name: "format",
      type: "select",
      required: true,
      defaultValue: "digital",
      options: [
        { label: "PDF / EPUB", value: "digital" },
        { label: "Audiobook", value: "audiobook" }
      ]
    },
    { name: "valueCeiling", type: "number", admin: { description: "Max digital price this code can redeem against (same-or-lesser value)." } },
    { name: "downloadsGranted", type: "number", defaultValue: 1 },
    { name: "recipientEmail", type: "email" },
    { name: "message", type: "textarea" },
    { name: "expiresAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "redeemedBy", type: "relationship", relationTo: "users", admin: { readOnly: true } },
    { name: "redeemedBook", type: "relationship", relationTo: "books", admin: { readOnly: true } },
    { name: "redeemedDownload", type: "relationship", relationTo: "downloads", admin: { readOnly: true } },
    { name: "redeemedAt", type: "date", admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } } }
  ]
};
