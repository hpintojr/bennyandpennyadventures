import { bookFormats } from "@/lib/books";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");

function socialSameAs() {
  return [
    process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    process.env.NEXT_PUBLIC_FACEBOOK_URL,
    process.env.NEXT_PUBLIC_TIKTOK_URL,
    process.env.NEXT_PUBLIC_YOUTUBE_URL
  ].filter((url): url is string => typeof url === "string" && url.trim().length > 0);
}

export function organizationSchema() {
  const sameAs = socialSameAs();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Benny & Penny Adventures",
    url: base,
    logo: `${base}/images/og-image.png`,
    description:
      "Children's medical picture books that help kids understand infusions, ports, PICC lines, scans, hospital stays, and more.",
    founder: { "@type": "Person", name: "Michelle Marie Pinto, RN" },
    ...(sameAs.length ? { sameAs } : {})
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Benny & Penny Adventures",
    url: base,
    inLanguage: "en-US"
  };
}

type BookLike = {
  slug: string;
  title: string;
  description?: string;
  longDescription?: string;
  pages?: number;
  coverImage?: string;
};

export function bookSchema(book: BookLike) {
  const lowPrice = Math.min(...bookFormats.map((f) => f.price));
  const highPrice = Math.max(...bookFormats.map((f) => f.price));
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    url: `${base}/books/${book.slug}`,
    inLanguage: "en",
    bookFormat: "https://schema.org/EBook",
    description: book.longDescription || book.description,
    ...(book.pages ? { numberOfPages: book.pages } : {}),
    ...(book.coverImage ? { image: `${base}${book.coverImage}` } : {}),
    author: { "@type": "Person", name: "Michelle Marie Pinto, RN" },
    publisher: { "@type": "Organization", name: "Benny & Penny Adventures" },
    audience: { "@type": "PeopleAudience", suggestedMinAge: 3, suggestedMaxAge: 8 },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: lowPrice.toFixed(2),
      highPrice: highPrice.toFixed(2),
      offerCount: bookFormats.length,
      availability: "https://schema.org/InStock"
    }
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`
    }))
  };
}
