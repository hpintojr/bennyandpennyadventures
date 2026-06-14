# Stripe Sandbox Setup

Use Stripe sandbox/test mode only while the Benny & Penny checkout flow is under development.

## Keys

Add these values in Vercel Project Settings → Environment Variables and in local `.env.local` when testing locally.

```txt
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=rk_test_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Notes:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe for browser/client use.
- `STRIPE_SECRET_KEY` must stay server-side only.
- Prefer the restricted key (`rk_test_...`) if it has enough permissions for Checkout Sessions and related objects.
- Use the standard secret key (`sk_test_...`) only if the restricted key blocks early development.
- `STRIPE_WEBHOOK_SECRET` is separate from API keys and starts with `whsec_`.
- Do not paste secret keys into chat or commit them to GitHub.

## Current Code Status

The current branch includes:

- Stripe package dependency.
- Server-side Stripe client helper.
- `/api/checkout` route that creates a sandbox Checkout Session from cart items.
- `/api/stripe/webhook` route that verifies Stripe webhook signatures and logs supported events.
- Cart button wired to redirect customers to Stripe Checkout.

## Local Webhook Testing

Use the Stripe CLI to forward sandbox webhooks locally.

```txt
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a webhook signing secret that starts with `whsec_`. Use that value for local `STRIPE_WEBHOOK_SECRET`.

Do not use the Dashboard endpoint secret for CLI-forwarded events, and do not use the CLI secret for deployed Dashboard-managed webhook endpoints.

## Vercel Webhook Endpoint

After deployment, create a Stripe sandbox webhook endpoint pointing to:

```txt
https://bennyandpennyadventures.com/api/stripe/webhook
```

Recommended initial events:

```txt
checkout.session.completed
payment_intent.payment_failed
```

After creating the endpoint, copy its `whsec_...` signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`.

## Next Backend Step

The webhook route currently verifies and logs events. Next implementation pass should create records in Payload after `checkout.session.completed`:

- Orders.
- OrderItems.
- Downloads.
- AccessGrants.

Do not turn on live payments until legal pages, R2 fulfillment, checkout tests, webhook fulfillment, and attorney review are complete.
