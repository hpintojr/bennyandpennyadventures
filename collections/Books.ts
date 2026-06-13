import type { CollectionConfig } from "payload";

export const Books: CollectionConfig = {
  slug: "books",
  labels: {
    singular: "Book",
    plural: "Books & Products"
  },
  admin: {
    group: "Catalog",
    useAsTitle: "title",
    description: "Manage Benny & Penny books, formats, pricing, Stripe price IDs, and private R2 file keys.",
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
    { name: "shortDescription", type: "textarea", admin: { description: "Short product card text." } },
    { name: "longDescription", type: "textarea", admin: { description: "Long product detail page description." } },
    { name: "coverImagePath", type: "text", admin: { description: "Temporary public image path or future media reference." } },
    { name: "priceDigital", type: "number", defaultValue: 15.99, label: "PDF / EPUB price" },
    { name: "priceAudiobook", type: "number", defaultValue: 21.99, label: "Audiobook price" },
    { name: "pricePaperback", type: "number", defaultValue: 17.99, label: "Paperback price" },
    { name: "priceHardcover", type: "number", defaultValue: 24.99, label: "Hardcover price" },
    { name: "pdfObjectKey", type: "text", label: "PDF R2 object key", admin: { description: "Private R2 key, for example ebooks/book-1/home-infusion-day.pdf" } },
    { name: "epubObjectKey", type: "text", label: "EPUB R2 object key", admin: { description: "Private R2 key, for example ebooks/book-1/home-infusion-day.epub" } },
    { name: "audiobookObjectKey", type: "text", label: "Audiobook R2 object key", admin: { description: "Private R2 key, for example audiobooks/book-1/home-infusion-day.mp3" } },
    { name: "stripeDigitalPriceId", type: "text", label: "Stripe PDF / EPUB price ID" },
    { name: "stripeAudiobookPriceId", type: "text", label: "Stripe audiobook price ID" },
    { name: "stripePaperbackPriceId", type: "text", label: "Stripe paperback price ID" },
    { name: "stripeHardcoverPriceId", type: "text", label: "Stripe hardcover price ID" }
  ]
};
