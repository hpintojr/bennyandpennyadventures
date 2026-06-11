import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./components/CartProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bennyandpennyadventures.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Benny & Penny's Adventures",
    template: "%s | Benny & Penny's Adventures"
  },
  description: "Children's medical books that help brave little hearts understand infusions, ports, PICC lines, scans, hospital stays, and more.",
  openGraph: {
    title: "Benny & Penny's Adventures",
    description: "Medical books for brave little hearts.",
    url: siteUrl,
    siteName: "Benny & Penny's Adventures",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website"
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/apple-touch-icon.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
