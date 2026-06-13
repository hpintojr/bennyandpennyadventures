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
  {
    label: "PDF / EPUB",
    shortLabel: "Digital",
    price: 15.99,
    description: "Instant digital download. Connect to Cloudflare R2 signed delivery later."
  },
  {
    label: "Audiobook",
    shortLabel: "Audio",
    price: 21.99,
    description: "Narrated audio edition. Store privately in Cloudflare R2 and deliver with signed access links."
  },
  {
    label: "Paperback",
    shortLabel: "Paperback",
    price: 17.99,
    description: "Soft cover, printed and shipped. POD vendor gets wired later."
  },
  {
    label: "Hardcover",
    shortLabel: "Hardcover",
    price: 24.99,
    description: "Durable keepsake edition. POD vendor gets wired later."
  }
];

export const books: Book[] = [
  {
    number: 1,
    slug: "home-infusion-day",
    title: "Benny & Penny's Home Infusion Day",
    topic: "Home infusions",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-1.png",
    badge: "Cover ready",
    status: "cover-ready",
    description: "Benny learns what a home infusion is and discovers that getting medicine at home can be cozy, calm, and even a little fun.",
    longDescription: "Benny learns what a home infusion is and discovers that getting medicine at home can be cozy, calm, and even a little fun. Written by a registered nurse and mom, this gentle story turns an unfamiliar experience into a brave little adventure — helping your child feel informed and reassured.",
    pdfPath: "/downloads/book-1.pdf",
    epubPath: "/downloads/book-1.epub",
    audioPath: "/downloads/book-1-audiobook.mp3",
    stripeLookupKey: "book_1_digital"
  },
  {
    number: 2,
    slug: "port-adventure",
    title: "Benny and Penny's Port Adventure",
    topic: "Ports",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-2.png",
    badge: "Cover ready",
    status: "cover-ready",
    description: "Penny meets her port and learns how this tiny helper under the skin makes getting medicine quick and brave-easy.",
    longDescription: "Penny meets her port and learns how this tiny helper under the skin makes getting medicine quick and brave-easy. This story helps children understand ports with soft language, friendly visuals, and a steady sense of courage.",
    pdfPath: "/downloads/book-2.pdf",
    epubPath: "/downloads/book-2.epub",
    audioPath: "/downloads/book-2-audiobook.mp3",
    stripeLookupKey: "book_2_digital"
  },
  {
    number: 3,
    slug: "picc-line-adventure",
    title: "Benny & Penny's PICC Line Adventure",
    topic: "PICC lines",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-3.png",
    badge: "Cover ready",
    status: "cover-ready",
    description: "Benny gets a PICC line and finds out how this special long line helps doctors care for him — with no big pokes needed.",
    longDescription: "Benny gets a PICC line and finds out how this special long line helps doctors care for him — with no big pokes needed. The book gently explains what a PICC line is and why it can help.",
    pdfPath: "/downloads/book-3.pdf",
    epubPath: "/downloads/book-3.epub",
    audioPath: "/downloads/book-3-audiobook.mp3",
    stripeLookupKey: "book_3_digital"
  },
  {
    number: 4,
    slug: "special-line-adventure",
    title: "Benny & Penny's Special Line Adventure",
    topic: "Central / special lines",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-4.png",
    badge: "Cover ready",
    status: "cover-ready",
    description: "Benny and Penny learn about special lines like Hickman, Broviac, tunneled, and central lines in a gentle, kid-friendly way.",
    longDescription: "Benny and Penny learn about special lines like Hickman, Broviac, tunneled, and central lines in a gentle, kid-friendly way. The adventure gives parents simple language for a complicated medical topic.",
    pdfPath: "/downloads/book-4.pdf",
    epubPath: "/downloads/book-4.epub",
    audioPath: "/downloads/book-4-audiobook.mp3",
    stripeLookupKey: "book_4_digital"
  },
  {
    number: 5,
    slug: "mri-adventure",
    title: "Benny & Penny's MRI Adventure",
    topic: "MRI scans",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-5.png",
    badge: "Art needed",
    status: "coming-soon",
    description: "A brave little guide to the loud-but-safe machine, staying still, and knowing what to expect during an MRI.",
    longDescription: "A brave little guide to the loud-but-safe machine, staying still, and knowing what to expect during an MRI. This story helps children prepare with less fear and more confidence.",
    pdfPath: "/downloads/book-5.pdf",
    epubPath: "/downloads/book-5.epub",
    audioPath: "/downloads/book-5-audiobook.mp3",
    stripeLookupKey: "book_5_digital"
  },
  {
    number: 6,
    slug: "hospital-sleepover",
    title: "Benny & Penny's Hospital Sleepover",
    topic: "Hospital stays",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-6.png",
    badge: "Art needed",
    status: "coming-soon",
    description: "A comforting story about overnight hospital stays, what to pack, who helps, and how home can still feel close.",
    longDescription: "A comforting story about overnight hospital stays, what to pack, who helps, and how home can still feel close. Benny and Penny show children that a hospital sleepover can feel safer when they know what is coming.",
    pdfPath: "/downloads/book-6.pdf",
    epubPath: "/downloads/book-6.epub",
    audioPath: "/downloads/book-6-audiobook.mp3",
    stripeLookupKey: "book_6_digital"
  },
  {
    number: 7,
    slug: "ambulance-adventure",
    title: "Benny & Penny's Ambulance Adventure",
    topic: "Ambulance rides",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-7.png",
    badge: "Art needed",
    status: "coming-soon",
    description: "Taking the scary out of sirens, lights, stretchers, and the helpers who ride along to keep kids safe.",
    longDescription: "Taking the scary out of sirens, lights, stretchers, and the helpers who ride along to keep kids safe. This adventure frames an ambulance ride as support, speed, and care.",
    pdfPath: "/downloads/book-7.pdf",
    epubPath: "/downloads/book-7.epub",
    audioPath: "/downloads/book-7-audiobook.mp3",
    stripeLookupKey: "book_7_digital"
  },
  {
    number: 8,
    slug: "surgery-day",
    title: "Benny & Penny's Surgery Day",
    topic: "Surgery day",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-8.png",
    badge: "Art needed",
    status: "coming-soon",
    description: "A gentle walk through special sleep, the people who help, and waking up brave after surgery.",
    longDescription: "A gentle walk through special sleep, the people who help, and waking up brave after surgery. Benny and Penny help children understand the steps without making the day feel too big.",
    pdfPath: "/downloads/book-8.pdf",
    epubPath: "/downloads/book-8.epub",
    audioPath: "/downloads/book-8-audiobook.mp3",
    stripeLookupKey: "book_8_digital"
  },
  {
    number: 9,
    slug: "lab-draw-adventure",
    title: "Benny & Penny's Lab Draw Adventure",
    topic: "Lab draws",
    ages: "3–8",
    pages: 32,
    coverImage: "/images/book-9.png",
    badge: "Art needed",
    status: "coming-soon",
    description: "Simple tips and a brave little story for calmer blood draws, deep breaths, and proud moments after.",
    longDescription: "Simple tips and a brave little story for calmer blood draws, deep breaths, and proud moments after. This adventure helps children know what a lab draw is and how they can get through it.",
    pdfPath: "/downloads/book-9.pdf",
    epubPath: "/downloads/book-9.epub",
    audioPath: "/downloads/book-9-audiobook.mp3",
    stripeLookupKey: "book_9_digital"
  }
];

export function getBookBySlug(slug: string) {
  return books.find((book) => book.slug === slug);
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
