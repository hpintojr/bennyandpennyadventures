export type BookFormat = {
  label: "PDF / EPUB" | "Audiobook" | "Paperback" | "Hardcover";
  shortLabel: "Digital" | "Audio" | "Paperback" | "Hardcover";
  price: number;
  description: string;
};

export type Book = {
  number: number;
  slug: string;
  title: string;
  topic: string;
  ages: string;
  pages: number;
  coverImage: string;
  badge: string;
  status: "cover-ready" | "coming-soon";
  description: string;
  longDescription: string;
  pdfPath: string;
  epubPath: string;
  audioPath: string;
  stripeLookupKey: string;
};

export const bookFormats: BookFormat[] = [
  { label: "PDF / EPUB", shortLabel: "Digital", price: 15.99, description: "Instant digital download. Connect to Cloudflare R2 signed delivery later." },
  { label: "Audiobook", shortLabel: "Audio", price: 21.99, description: "Narrated audio edition. Store privately in Cloudflare R2 and deliver with signed access links." },
  { label: "Paperback", shortLabel: "Paperback", price: 17.99, description: "Soft cover, printed and shipped. POD vendor gets wired later." },
  { label: "Hardcover", shortLabel: "Hardcover", price: 24.99, description: "Durable keepsake edition. POD vendor gets wired later." }
];

const fallbackBook = (
  number: number,
  slug: string,
  title: string,
  topic: string,
  status: Book["status"],
  coverImage = `/images/book-${number}.png`,
): Book => ({
  number,
  slug,
  title,
  topic,
  ages: "3–8",
  pages: 32,
  coverImage,
  badge: status === "cover-ready" ? "Cover ready" : "Coming soon",
  status,
  description: `A gentle Benny & Penny story that helps children understand ${topic.toLowerCase()} with calm, age-appropriate language.`,
  longDescription: `A gentle Benny & Penny story that helps children and caregivers prepare for ${topic.toLowerCase()} with clear explanations, reassurance, and encouragement.`,
  pdfPath: `/downloads/book-${number}.pdf`,
  epubPath: `/downloads/book-${number}.epub`,
  audioPath: `/downloads/book-${number}-audiobook.mp3`,
  stripeLookupKey: `book_${number}_digital`,
});

// Safety-net catalog used only when the database is unavailable. Keep this in the
// same order and naming as the production books table.
export const books: Book[] = [
  fallbackBook(1, "home-infusion-day", "Benny & Penny Home Infusion Day", "Home infusions", "cover-ready"),
  fallbackBook(2, "port-access-adventure", "Benny & Penny Port Access Adventure", "Access ports", "cover-ready"),
  fallbackBook(3, "picc-line-adventure", "Benny & Penny PICC Line Adventure", "PICC lines", "cover-ready"),
  fallbackBook(4, "subcutaneous-infusion-adventure", "Benny & Penny Subcutaneous Infusion Adventure", "Subcutaneous infusions", "cover-ready"),
  fallbackBook(5, "special-line-adventure", "Benny & Penny Special Line Adventure", "Central / special lines", "coming-soon"),
  fallbackBook(6, "lab-draw-adventure", "Benny & Penny Lab Draw Adventure", "Lab draws", "coming-soon"),
  fallbackBook(7, "mri-adventure", "Benny & Penny MRI Adventure", "MRI scans", "coming-soon"),
  fallbackBook(8, "hospital-sleepover", "Benny & Penny Hospital Sleepover", "Hospital stays", "coming-soon"),
  fallbackBook(9, "ambulance-adventure", "Benny & Penny Ambulance Adventure", "Ambulance rides", "coming-soon"),
  fallbackBook(10, "surgery-day", "Benny & Penny Surgery Day", "Surgery day", "coming-soon", "/images/og-image.png"),
];

export function getBookBySlug(slug: string) {
  return books.find((book) => book.slug === slug);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
