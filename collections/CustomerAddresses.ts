import type { CollectionConfig } from "payload";

export const CustomerAddresses: CollectionConfig = {
  slug: "customer-addresses",
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "customer", "city", "state", "phone"]
  },
  fields: [
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
      label: "Shipping phone number",
      admin: {
        description: "Optional. Used only for shipping, order, or support issues."
      }
    },
    { name: "isDefaultShipping", type: "checkbox", defaultValue: false }
  ]
};
