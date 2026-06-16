# Sequenzy Email Setup

Email provider for Benny & Penny (replaces Mailjet). Uses Sequenzy's transactional
**direct-content** send — fully-formed HTML from the app, no dashboard templates needed.

## Env vars (Vercel + local `.env`)

```
SEQUENZY_API_KEY=seq_user_...          # from Sequenzy → Settings → API Keys (keep secret)
SEQUENZY_FROM_EMAIL=hello@bennyandpennyadventures.com
SEQUENZY_FROM_NAME=Benny & Penny's Adventures
# SEQUENZY_API_URL is optional; defaults to https://api.sequenzy.com/api/v1
```

## One-time Sequenzy dashboard setup
1. Verify your sending **domain** (SPF/DKIM) in Sequenzy, or at least create a **sender profile**.
   Direct-content sends require a sender profile, or you'll get `No sender profile configured`.
   If your `from` domain isn't verified, Sequenzy silently uses the default sender profile.

## What's wired
- `lib/email.ts` — `sendEmail()` (POST `/transactional/send`, Bearer auth, `{ to, subject, body, preview, from }`), fails soft; `sendGiftEmail()` builds the branded gift email.
- `/api/portal/gifts` POST — after a customer creates a gift, the recipient is emailed the code + a `Claim my free book` button linking to `/gift/redeem?code=…`. The code is still shown on-screen as a fallback. Response includes `emailed: true/false`.

## Next emails to wire (same `sendEmail` helper)
- Order receipt / "set your password" link after purchase.
- Gift **redeemed** confirmation to the gifter.
- Password reset.
- Marketing/nurture to gifted leads (or via Sequenzy sequences using tags/events).

## Test
1. Set the env vars + redeploy.
2. Portal → Gifts → create a gift to an inbox you control → confirm the email arrives and the redeem link works.
3. If it doesn't send, check Vercel logs for the Sequenzy error (e.g. sender profile / domain).
