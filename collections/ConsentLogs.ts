import type { CollectionConfig } from "payload";

export const ConsentLogs: CollectionConfig = {
  slug: "consent-logs",
  labels: {
    singular: "Consent Log",
    plural: "Consent Logs"
  },
  admin: {
    useAsTitle: "email",
    description: "Audit trail for contact, email, SMS, newsletter, checkout, and privacy-request consent events.",
    defaultColumns: ["source", "consentType", "email", "phone", "optIn", "createdAt"]
  },
  fields: [
    {
      name: "source",
      type: "select",
      required: true,
      options: [
        { label: "Contact Form", value: "contact-form" },
        { label: "Newsletter", value: "newsletter" },
        { label: "Privacy Request", value: "privacy-request" },
        { label: "Checkout", value: "checkout" },
        { label: "Account / Portal", value: "account" },
        { label: "Admin", value: "admin" },
        { label: "Other", value: "other" }
      ]
    },
    {
      name: "consentType",
      type: "select",
      required: true,
      options: [
        { label: "Contact Consent", value: "contact-consent" },
        { label: "Email Marketing", value: "email-marketing" },
        { label: "SMS / Text Messaging", value: "sms" },
        { label: "Privacy Request", value: "privacy-request" },
        { label: "Terms Acceptance", value: "terms" },
        { label: "Other", value: "other" }
      ]
    },
    { name: "name", type: "text" },
    { name: "email", type: "email" },
    { name: "phone", type: "text" },
    { name: "optIn", type: "checkbox", defaultValue: true },
    { name: "consentText", type: "textarea" },
    { name: "sourcePath", type: "text" },
    { name: "ipAddress", type: "text" },
    { name: "userAgent", type: "textarea" },
    { name: "relatedCollection", type: "text" },
    { name: "relatedId", type: "text" },
    { name: "metadata", type: "json" }
  ]
};
