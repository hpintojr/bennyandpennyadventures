import type { CollectionConfig } from "payload";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "marketingOptIn", "source", "createdAt"]
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true },
    { name: "firstName", type: "text" },
    { name: "lastName", type: "text" },
    { name: "source", type: "text", admin: { description: "Homepage, footer, checkout, printable library, etc." } },
    { name: "marketingOptIn", type: "checkbox", defaultValue: true },
    { name: "productUpdatesOptIn", type: "checkbox", defaultValue: true },
    { name: "freePrintablesOptIn", type: "checkbox", defaultValue: true },
    { name: "unsubscribedAt", type: "date" },
    {
      name: "topics",
      type: "select",
      hasMany: true,
      options: [
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
      ]
    }
  ]
};
