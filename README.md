# Benny & Penny's Adventures Website

Production website and customer portal for **Benny & Penny's Adventures**, a children's medical book series and digital-product business.

The site is built with **Next.js App Router**, **Payload CMS**, **Neon Postgres**, **Stripe Checkout**, **Cloudflare R2 signed digital delivery**, and transactional email support.

## Current status

This repo is no longer a starter site. It now includes the public marketing site, product catalog, checkout flow, Payload Admin backend, customer portal, private digital delivery foundation, promotions/gifting, privacy/compliance pages, SEO/AI metadata, and transactional email helpers.

### Built and active

- Public homepage and brand site.
- Books catalog with 9 planned titles.
- Product detail pages at `/books/[slug]`.
- Cart and Stripe Checkout flow.
- Payload CMS Admin at `/admin`.
- Neon Postgres database integration.
- Orders, order items, customers/users, customer addresses, downloads/media, subscribers, support tickets, privacy requests, consent logs, gifts, promotions, password tokens, and access grants collections.
- Customer Portal routes: `/portal`, `/portal/login`, `/portal/orders`, `/portal/addresses`, `/portal/library`.
- Account/password routes: `/forgot-password` and `/account/set-password`.
- Gift redemption flow.
- Cloudflare R2 signed-link digital delivery support.
- Sequenzy transactional email support, with Mailjet intended as backup or secondary provider.
- Privacy, Terms, Messaging Terms, California Notice, State Rights, and Privacy Requests pages.
- Sitemap, robots, JSON-LD, `llms.txt`, OG image, favicon, and baseline security headers.

### Still in progress / launch cleanup

- Live verification of Payload access-control lockdown.
- Bot/spam protection on public forms, preferably honeypot + Cloudflare Turnstile + rate limiting.
- Sequenzy environment verification and email delivery testing.
- Mailjet fallback/secondary-provider design and delivery testing.
- Full end-to-end tests for register/setup link, forgot password, order receipt, gift email, gift redemption, and returning-customer flows.
- Customer support portal workflow.
- POD/Lulu print fulfillment automation.
- Admin actions such as refund, resend receipt, and regenerate download access.
- Admin CSS consolidation.
- Final business/legal readiness: business mailing address or PO Box, DBA, bank account, Stripe live readiness, and attorney review.

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Payload CMS 3
- Neon Postgres
- Stripe Checkout and webhooks
- Cloudflare R2 via S3-compatible SDK
- Sequenzy transactional email
- Mailjet planned as backup or secondary email provider
- Vercel hosting
- Cloudflare DNS

## Local setup

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build locally:

```bash
npm run build
```

Start production build locally:

```bash
npm run start
```

Payload CLI:

```bash
npm run payload
```

## Configuration

Use `.env.example` as the starting point for local configuration. Do not commit real secrets.

Configuration groups include:

- Site URL.
- Payload and database connection.
- Stripe checkout and webhook settings.
- Cloudflare R2 storage settings.
- Sequenzy email sender/API settings.
- Mailjet email sender/API settings if used as backup or secondary provider.

Email sending is designed to fail soft. If the primary email provider is not configured, email helper calls should return a non-fatal result instead of breaking checkout, password reset, gift, or account flows.

## Email provider strategy

Current implementation uses Sequenzy for transactional direct-content email sends.

Preferred long-term structure:

- **Transactional/system emails:** account setup, forgot-password, order receipts, gift delivery, gift redeemed, digital delivery, support replies, dunning, and security/account notices.
- **Marketing/promotional emails:** newsletter campaigns, product launches, nurture sequences, review requests, win-back, partner/influencer offers, and broader promotional campaigns.

Recommended architecture:

1. Keep a single internal email interface in app code, such as `sendEmail()` plus purpose-specific helpers.
2. Route transactional/system messages through the primary transactional provider.
3. Keep Mailjet available as either:
   - a backup provider if the primary provider fails or is unavailable, or
   - a dedicated marketing/promotional provider if segmentation, templates, campaigns, or compliance workflows are cleaner there.
4. Do not mix provider-specific API logic throughout the app. Keep provider logic isolated in email service modules.
5. Log email purpose, provider, result, and failure reason where practical so delivery problems can be audited later.
6. Keep unsubscribe and consent behavior separate for marketing emails; system/transactional emails should not depend on marketing opt-in when they are required for purchases, account access, or security.

Current email helper file:

```txt
lib/email.ts
```

Current supported email/helper functions:

- `sendEmail()` — low-level Sequenzy transactional send.
- `sendGiftEmail()` — sends a gift redemption link/code.
- `sendOrderReceiptEmail()` — sends order receipt and account setup link.
- `sendGiftRedeemedEmail()` — notifies the gifter that a gift was claimed.
- `upsertSubscriber()` — creates/updates a Sequenzy subscriber for lead tracking.
- `sendPasswordLinkEmail()` — sends setup/reset password links.

Future cleanup recommendation:

```txt
lib/email/index.ts              # app-facing email interface
lib/email/providers/sequenzy.ts # Sequenzy provider implementation
lib/email/providers/mailjet.ts  # Mailjet provider implementation
lib/email/templates/*           # reusable message builders/templates
```

## Password and account email flow

Password token logic lives in:

```txt
lib/authTokens.ts
```

Relevant routes/pages:

```txt
/api/auth/forgot-password
/api/auth/set-password
/forgot-password
/account/set-password
```

Security notes:

- Password tokens are stored hashed.
- Raw tokens are only used in the email link.
- Tokens are single-use.
- Links expire after 48 hours by default.
- Forgot-password responses are intentionally generic to avoid email enumeration.

## Stripe / checkout status

Stripe Checkout is implemented.

Current behavior:

- Server validates cart items before creating a Checkout Session.
- Promotion codes are allowed.
- Automatic tax is off unless explicitly enabled in deployment settings.
- Saved customer addresses can prefill Stripe Checkout when a signed-in customer selects saved addresses.
- Checkout metadata can include customer and selected address IDs.
- Successful checkout returns customers to `/thank-you` with a Stripe Checkout Session reference.

Primary checkout route:

```txt
app/(frontend)/api/checkout/route.ts
```

## Customer Portal

Portal source-of-truth model:

```txt
users = customer accounts and auth
orders = receipt/order history
order-items = purchased book formats
customer-addresses = billing/shipping address book
downloads = digital/audiobook delivery records
access-grants = gifted/admin access
```

Customer-facing portal routes:

```txt
/portal
/portal/login
/portal/orders
/portal/addresses
/portal/library
```

Portal APIs:

```txt
/api/portal/me
/api/portal/logout
/api/portal/orders
/api/portal/addresses
/api/portal/library
/api/portal/downloads
```

## Digital delivery

Paid PDF, EPUB, and audiobook files should not be public files.

Digital delivery direction:

```txt
Stripe purchase or access grant
→ Payload download/access record
→ signed-in customer requests download
→ app verifies ownership
→ app creates short-lived R2 signed URL
→ app tracks usage
```

Important rule: never expose permanent public ebook, EPUB, audiobook, or raw R2 object URLs in the customer portal.

## Privacy and compliance pages

Current legal/compliance pages:

```txt
/privacy
/terms
/sms-terms
/privacy/california
/privacy/state-rights
/privacy/requests
```

Before broad launch or marketing campaigns:

- Add the official business mailing address or PO Box where required.
- Confirm unsubscribe and consent-log behavior.
- Add bot/spam protection to public forms.
- Have legal/compliance language reviewed by an attorney.

## Important project docs

The main workspace context is maintained in:

```txt
hpintojr/My-Workspace
```

Start there for current project state:

```txt
CLAUDE.md
01 Daily Logs/[C] 2026-06-15.md
02 Projects/Benny & Penny's Adventures/Benny & Penny's Adventures Overview.md
02 Projects/Benny & Penny's Adventures/[C] Backlog & Launch Checklist.md
02 Projects/Benny & Penny's Adventures/[C] Site Assessment 2026-06-15.md
02 Projects/Benny & Penny's Adventures/[C] Portal and Digital Delivery Implementation Notes.md
02 Projects/Benny & Penny's Adventures/[C] Promotions, Gifting & Access Grants Plan.md
```

## Common working commands

```bash
npm install
npm run dev
npm run build
npm run start
```

## Deployment

The site deploys through Vercel from GitHub `main`.

Deployment reminders:

- Batch related fixes instead of deploying every tiny edit.
- Confirm required Neon SQL patches are applied before deploying code that depends on new columns/tables.
- Keep setup/debug routes disabled in production.
- Do not commit secrets, API keys, database URLs, passwords, or private tokens.
