# Benny & Penny's Adventures Website

Deployable Next.js starter site for the Benny & Penny's Adventures children's medical book series.

## What's included

- Next.js App Router + TypeScript + Tailwind CSS
- Home page based on the approved homepage sample
- Books catalog with all 9 planned titles
- Product detail pages at `/books/[slug]`
- Working browser cart using `localStorage`
- For Parents page with guide, printable, glossary, and support sections
- Contact page with mailto fallback
- Thank-you page for newsletter signup redirects
- Placeholder Privacy and Terms pages
- Image and download drop-zone folders
- Original HTML samples copied into `docs/wireframes/`

## Local setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## GitHub setup

From this folder:

```bash
git init
git add .
git commit -m "Initial Benny and Penny website"
git branch -M main
git remote add origin https://github.com/hpintojr/bennyandpennyadventures.git
git push -u origin main
```

## Vercel setup

1. Import the GitHub repo into Vercel.
2. Framework preset: **Next.js**.
3. Build command: `npm run build`.
4. Output directory: leave blank / default.
5. Add environment variables from `.env.example` as needed.
6. Deploy on Hobby while testing. Move to Pro when it becomes a live commercial store.

## Image loading

Drop images into `public/images/` using the filenames listed in `public/images/README.md`.
The site shows soft placeholders until matching files exist.

## PDF / EPUB loading

For local testing, drop files into `public/downloads/` using the names listed in `public/downloads/README.md`.

Important: for launch, paid ebooks should move to private Cloudflare R2 storage and be delivered through signed, time-limited links after Stripe payment.

## Stripe / checkout status

The cart works for testing selections, quantities, and pricing. Stripe Checkout is intentionally left disabled until the Stripe account and products/prices are created.

Future checkout integration target:

- Create Stripe products/prices for each format.
- POST cart line items to an API route.
- Create Stripe Checkout session.
- On webhook success, grant ebook access.
- Send signed Cloudflare R2 links for PDF/EPUB downloads.

## Main content files

- Book catalog: `lib/books.ts`
- Global styling: `app/globals.css`
- Header/cart count: `app/components/Header.tsx`
- Product add-to-cart: `app/components/ProductActions.tsx`
- Cart page client: `app/components/CartPageClient.tsx`
