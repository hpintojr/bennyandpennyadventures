import type { CollectionConfig } from "payload";

export const Books: CollectionConfig = {
  slug: "books",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "priceDigital", "priceAudiobook", "pricePaperback", "priceHardcover"]
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "number", type: "number", required: true },
    { name: "topic", type: "text" },
    { name: "ages", type: "text" },
    { name: "pages", type: "number" },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Coming Soon", value: "coming-soon" },
        { label: "Live", value: "live" }
      ]
    },
    { name: "shortDescription", type: "textarea" },
    { name: "longDescription", type: "textarea" },
    { name: "coverImagePath", type: "text", admin: { description: "Temporary public image path or future media reference." } },
    { name: "priceDigital", type: "number", defaultValue: 15.99 },
    { name: "priceAudiobook", type: "number", defaultValue: 21.99 },
    { name: "pricePaperback", type: "number", defaultValue: 17.99 },
    { name: "priceHardcover", type: "number", defaultValue: 24.99 },
    { name: "pdfObjectKey", type: "text", admin: { description: "Private R2 key, for example ebooks/book-1/home-infusion-day.pdf" } },
    { name: "epubObjectKey", type: "text", admin: { description: "Private R2 key, for example ebooks/book-1/home-infusion-day.epub" } },
    { name: "audiobookObjectKey", type: "text", admin: { description: "Private R2 key, for example audiobooks/book-1/home-infusion-day.mp3" } },
    { name: "stripeDigitalPriceId", type: "text" },
    { name: "stripeAudiobookPriceId", type: "text" },
    { name: "stripePaperbackPriceId", type: "text" },
    { name: "stripeHardcoverPriceId", type: "text" }
  ]
};
