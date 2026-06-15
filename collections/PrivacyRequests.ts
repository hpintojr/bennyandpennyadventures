import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

export const PrivacyRequests: CollectionConfig = {
  slug: "privacy-requests",
  access: adminOnly,
  labels: {
    singular: "Privacy Request",
    plural: "Privacy Requests"
  },
  admin: {
    useAsTitle: "email",
    description: "Consumer privacy requests, opt-out requests, correction requests, deletion requests, and related admin handling.",
    defaultColumns: ["requestType", "state", "name", "email", "status", "createdAt"]
  },
  fields: [
    {
      name: "requestType",
      type: "select",
      required: true,
      options: [
        { label: "Access / Know", value: "access" },
        { label: "Delete", value: "delete" },
        { label: "Correct", value: "correct" },
        { label: "Do Not Sell or Share", value: "do-not-sell-share" },
        { label: "Limit Sensitive Personal Information", value: "limit-sensitive" },
        { label: "Unsubscribe from Email", value: "unsubscribe-email" },
        { label: "Opt Out of SMS", value: "opt-out-sms" },
        { label: "Other", value: "other" }
      ]
    },
    { name: "state", type: "text", required: true },
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "message", type: "textarea", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "Verifying", value: "verifying" },
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
        { label: "Denied", value: "denied" },
        { label: "Spam", value: "spam" }
      ]
    },
    {
      name: "verificationStatus",
      type: "select",
      defaultValue: "not-started",
      options: [
        { label: "Not Started", value: "not-started" },
        { label: "Pending", value: "pending" },
        { label: "Verified", value: "verified" },
        { label: "Unable to Verify", value: "unable-to-verify" }
      ]
    },
    { name: "contactConsent", type: "checkbox", required: true, defaultValue: false },
    { name: "submittedAt", type: "date" },
    { name: "requestIpAddress", type: "text" },
    { name: "requestUserAgent", type: "textarea" },
    { name: "adminNotes", type: "textarea" }
  ]
};
