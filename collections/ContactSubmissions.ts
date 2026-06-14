import type { CollectionConfig } from "payload";

export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  admin: {
    hidden: true,
    useAsTitle: "name",
    defaultColumns: ["name", "email", "phone", "inquiryType", "smsOptIn", "emailOptIn", "status", "createdAt"]
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "inquiryType", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    { name: "contactConsent", type: "checkbox", required: true, defaultValue: false },
    { name: "emailOptIn", type: "checkbox", defaultValue: false },
    { name: "smsOptIn", type: "checkbox", defaultValue: false },
    { name: "smsConsentText", type: "textarea" },
    { name: "consentTimestamp", type: "date" },
    { name: "consentIpAddress", type: "text" },
    { name: "consentUserAgent", type: "text" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "In Progress", value: "in-progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Spam", value: "spam" }
      ]
    },
    { name: "adminNotes", type: "textarea" }
  ]
};
