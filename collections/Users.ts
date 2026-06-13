import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "firstName", "lastName", "role"]
  },
  fields: [
    {
      name: "firstName",
      type: "text"
    },
    {
      name: "lastName",
      type: "text"
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "customer",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Customer", value: "customer" }
      ]
    },
    {
      name: "phone",
      type: "text",
      label: "Phone number",
      admin: {
        description: "Optional. Used only for order, shipping, or support issues unless the customer separately opts into SMS."
      }
    },
    {
      name: "smsMarketingOptIn",
      type: "checkbox",
      defaultValue: false,
      label: "SMS marketing opt-in",
      admin: {
        description: "Keep false unless the customer separately gives SMS marketing consent."
      }
    }
  ]
};
