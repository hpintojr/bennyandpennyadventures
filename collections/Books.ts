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
    description: "Manage Benny & Penny books, product page content, formats, pricing, Stripe IDs, and private R2 file keys.",
    defaultColumns: ["number", "title", "status", "priceDigital", "priceAudiobook", "pricePaperback", "priceHardcover"]
  },
  fields: [
    { name: "title", type: "text", required: true, admin: { description: "Product page title." } },
    { name: "slug", type: "text", required: true, unique: true, admin: { description: "Used in the product URL, for example /books/home-infusion-day." } },
    { name: "number", type: "number", required: true, admin: { description: "Series number shown as Book 1, Book 2, etc." } },
    { name: "topic", type: "text", admin: { description: "Shown on cards and product detail pages." } },
    { name: "ages", type: "text", admin: { description: "Shown on product detail pages, for example 3–8." } },
    { name: "pages", type: "number", admin: { description: "Shown on product detail pages." } },
    { name: "badge", type: "text", admin: { description: "Website badge, for example Cover ready or Art needed." } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "coming-soon",
      options: [
        { label: "Cover Ready", value: "cover-ready" },
        { label: "Coming Soon", value: "coming-soon" },
        { label: "Live", value: "live" },
        { label: "Draft", value: "draft" }
      ]
    },
    { name: "shortDescription", type: "textarea", admin: { description: "Short product card text. Maps to book.description." } },
    { name: "longDescription", type: "textarea", admin: { description: "Long product detail page description." } },
    { name: "coverImage", type: "text", admin: { description: "Public cover image path used by the website, for example /images/book-1.png." } },
    { name: "coverImagePath", type: "text", admin: { description: "Legacy/admin cover path. Keep synced with Cover Image until media upload is added." } },
    { name: "pagePreviewOne", type: "text", admin: { description: "Inside preview image 1, for example /images/book-1-page-1.png." } },
    { name: "pagePreviewTwo", type: "text", admin: { description: "Inside preview image 2, for example /images/book-1-page-2.png." } },
    { name: "pdfPath", type: "text", admin: { description: "Temporary local test path, for example /downloads/book-1.pdf." } },
    { name: "epubPath", type: "text", admin: { description: "Temporary local test path, for example /downloads/book-1.epub." } },
    { name: "audioPath", type: "text", admin: { description: "Temporary local test path, for example /downloads/book-1-audiobook.mp3." } },
    { name: "priceDigital", type: "number", defaultValue: 15.99, label: "PDF / EPUB price" },
    { name: "priceAudiobook", type: "number", defaultValue: 21.99, label: "Audiobook price" },
    { name: "pricePaperback", type: "number", defaultValue: 17.99, label: "Paperback price" },
    { name: "priceHardcover", type: "number", defaultValue: 24.99, label: "Hardcover price" },
    { name: "digitalDescription", type: "textarea", label: "PDF / EPUB format description" },
    { name: "audiobookDescription", type: "textarea", label: "Audiobook format description" },
    { name: "paperbackDescription", type: "textarea", label: "Paperback format description" },
    { name: "hardcoverDescription", type: "textarea", label: "Hardcover format description" },
    { name: "pdfObjectKey", type: "text", label: "PDF R2 object key", admin: { description: "Private R2 key, for example ebooks/book-1/home-infusion-day.pdf" } },
    { name: "epubObjectKey", type: "text", label: "EPUB R2 object key", admin: { description: "Private R2 key, for example ebooks/book-1/home-infusion-day.epub" } },
    { name: "audiobookObjectKey", type: "text", label: "Audiobook R2 object key", admin: { description: "Private R2 key, for example audiobooks/book-1/home-infusion-day.mp3" } },
    { name: "stripeLookupKey", type: "text", label: "Stripe lookup key" },
    { name: "stripeDigitalPriceId", type: "text", label: "Stripe PDF / EPUB price ID" },
    { name: "stripeAudiobookPriceId", type: "text", label: "Stripe audiobook price ID" },
    { name: "stripePaperbackPriceId", type: "text", label: "Stripe paperback price ID" },
    { name: "stripeHardcoverPriceId", type: "text", label: "Stripe hardcover price ID" }
  ]
};
