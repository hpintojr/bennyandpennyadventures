import type { CollectionConfig } from "payload";
import { adminOnly } from "@/lib/access";

export const OrderItems: CollectionConfig = {
  slug: "order-items",
  access: adminOnly,
  labels: {
    singular: "Order Detail",
    plural: "Order Details"
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["order", "title", "book", "format", "quantity", "unitPrice", "stripePriceId"]
  },
  fields: [
    { name: "order", type: "relationship", relationTo: "orders", required: true },
    { name: "book", type: "relationship", relationTo: "books" },
    { name: "title", type: "text", required: true },
    {
      name: "format",
      type: "select",
      required: true,
      options: [
        { label: "PDF / EPUB", value: "digital" },
        { label: "Audiobook", value: "audiobook" },
        { label: "Paperback", value: "paperback" },
        { label: "Hardcover", value: "hardcover" }
      ]
    },
    { name: "quantity", type: "number", required: true, defaultValue: 1 },
    { name: "unitPrice", type: "number", required: true },
    { name: "stripePriceId", type: "text" }
  ]
};
