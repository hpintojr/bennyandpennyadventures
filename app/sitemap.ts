import type { MetadataRoute } from "next";
import { books } from "@/lib/books";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/books`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/for-parents`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 }
  ];

  const bookRoutes: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${base}/books/${book.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [...staticRoutes, ...bookRoutes];
}
