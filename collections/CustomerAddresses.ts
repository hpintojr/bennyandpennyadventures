import type { CollectionConfig } from "payload";

export const CustomerAddresses: CollectionConfig = {
  slug: "customer-addresses",
  labels: {
    singular: "Customer Address",
    plural: "Customer Addresses"
  },
  admin: {
    useAsTitle: "fullName",
    description: "Structured customer addresses collected through checkout and customer account workflows.",
    defaultColumns: ["addressType", "fullName", "customer", "street1", "city", "state", "postalCode", "country", "phone"]
  },
  fields: [
    {
      name: "addressType",
      type: "select",
      required: true,
      defaultValue: "billing",
      options: [
        { label: "Billing", value: "billing" },
        { label: "Shipping", value: "shipping" }
      ]
    },
    { name: "customer", type: "relationship", relationTo: "users", required: true },
    { name: "fullName", type: "text", required: true },
    { name: "company", type: "text" },
    { name: "street1", type: "text", required: true },
    { name: "street2", type: "text" },
    { name: "city", type: "text", required: true },
    { name: "state", type: "text", required: true },
    { name: "postalCode", type: "text", required: true },
    { name: "country", type: "text", required: true, defaultValue: "US" },
    {
      name: "phone",
      type: "text",
      label: "Phone number"
    },
    { name: "isDefaultShipping", type: "checkbox", defaultValue: false }
  ]
};
