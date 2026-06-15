import type { CollectionConfig } from "payload";

export const CustomerAddresses: CollectionConfig = {
  slug: "customer-addresses",
  labels: {
    singular: "Customer Address",
    plural: "Customer Addresses"
  },
  admin: {
    useAsTitle: "fullName",
    description: "Structured customer addresses collected through checkout and managed in the customer Address Book.",
    defaultColumns: ["label", "addressType", "fullName", "customer", "city", "state", "postalCode", "isDefaultShipping", "isDefaultBilling", "isArchived"]
  },
  fields: [
    {
      name: "label",
      type: "text",
      label: "Label",
      admin: {
        description: "Friendly nickname for this address, e.g. Home, Work, Grandma."
      }
    },
    {
      name: "addressType",
      type: "select",
      required: true,
      defaultValue: "billing",
      options: [
        { label: "Billing", value: "billing" },
        { label: "Shipping", value: "shipping" },
        { label: "Billing & Shipping", value: "both" }
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
    {
      name: "isDefaultShipping",
      type: "checkbox",
      label: "Default shipping address",
      defaultValue: false
    },
    {
      name: "isDefaultBilling",
      type: "checkbox",
      label: "Default billing address",
      defaultValue: false
    },
    {
      name: "isArchived",
      type: "checkbox",
      label: "Archived",
      defaultValue: false,
      admin: {
        description: "Archived addresses stay on past orders but are hidden from the active Address Book."
      }
    },
    {
      name: "lastUsedAt",
      type: "date",
      label: "Last used",
      admin: {
        description: "Updated when this address is used on a new order.",
        date: { pickerAppearance: "dayAndTime" }
      }
    }
  ]
};
