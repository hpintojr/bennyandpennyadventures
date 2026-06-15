import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "User",
    plural: "Users"
  },
  auth: true,
  admin: {
    useAsTitle: "email",
    description: "Manage backend users, customers, roles, support contact details, and customer purchase history.",
    defaultColumns: ["email", "firstName", "lastName", "role"]
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "First name"
    },
    {
      name: "lastName",
      type: "text",
      label: "Last name"
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "customer",
      admin: {
        description: "Admins can manage the backend. Customers will eventually use the member portal."
      },
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
    },
    {
      name: "purchaseHistory",
      type: "join",
      collection: "orders",
      on: "customer",
      label: "Purchase history",
      admin: {
        description: "Orders linked to this customer through the Orders → Customer relationship. New Stripe purchases should appear here once fulfillment creates the order."
      }
    }
  ]
};