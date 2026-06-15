import type { CollectionConfig } from "payload";

const yesNoCell = "/app/(payload)/components/BooleanYesNoCell.tsx#BooleanYesNoCell";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Subscriber", plural: "Subscribers" },
  admin: {
    useAsTitle: "email",
    description: "Newsletter and resource-library signups, including customer conversion status for marketing segmentation.",
    defaultColumns: ["email", "marketingOptIn", "customerStatus", "linkedCustomer", "lastPurchaseAt", "source", "createdAt"]
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true },
    { name: "firstName", type: "text" },
    { name: "lastName", type: "text" },
    { name: "source", type: "text" },
    { name: "marketingOptIn", type: "checkbox", defaultValue: true, admin: { components: { Cell: yesNoCell } } },
    { name: "productUpdatesOptIn", type: "checkbox", defaultValue: true },
    { name: "freePrintablesOptIn", type: "checkbox", defaultValue: true },
    {
      name: "customerStatus",
      type: "select",
      required: true,
      defaultValue: "subscriber-only",
      label: "Customer status",
      admin: {
        description: "Use this to segment marketing between subscribers who have purchased and subscribers who have not purchased yet."
      },
      options: [
        { label: "Subscriber only", value: "subscriber-only" },
        { label: "Customer", value: "customer" }
      ]
    },
    {
      name: "linkedCustomer",
      type: "relationship",
      relationTo: "users",
      label: "Linked customer",
      admin: {
        description: "Customer/User record with the same email address, when this subscriber has purchased or already has a customer account."
      }
    },
    {
      name: "becameCustomerAt",
      type: "date",
      label: "Became customer at",
      admin: {
        date: { pickerAppearance: "dayAndTime" }
      }
    },
    {
      name: "lastPurchaseAt",
      type: "date",
      label: "Last purchase at",
      admin: {
        date: { pickerAppearance: "dayAndTime" }
      }
    },
    {
      name: "lastOrder",
      type: "relationship",
      relationTo: "orders",
      label: "Last order"
    },
    {
      name: "lifetimeOrderCount",
      type: "number",
      defaultValue: 0,
      label: "Lifetime order count"
    },
    {
      name: "lifetimeSpend",
      type: "number",
      defaultValue: 0,
      label: "Lifetime spend"
    },
    { name: "unsubscribedAt", type: "date" },
    { name: "topics", type: "select", hasMany: true, options: [
      { label: "Home infusions", value: "home-infusions" },
      { label: "Ports", value: "ports" },
      { label: "PICC lines", value: "picc-lines" },
      { label: "MRI", value: "mri" },
      { label: "Hospital stays", value: "hospital-stays" },
      { label: "Ambulance rides", value: "ambulance-rides" },
      { label: "Surgery", value: "surgery" },
      { label: "Lab draws", value: "lab-draws" },
      { label: "New releases", value: "new-releases" },
      { label: "Free printables", value: "free-printables" }
    ] }
  ]
};