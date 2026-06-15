import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");

// AI answer engines we explicitly welcome so the books can be discovered, quoted, and cited.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended"
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/portal", "/thank-you"] },
      { userAgent: aiCrawlers, allow: "/", disallow: ["/admin", "/api", "/portal", "/thank-you"] }
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base
  };
}
