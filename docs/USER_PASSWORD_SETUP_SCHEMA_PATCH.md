# User Password Setup Schema Patch

Adds a one-time flag so a customer can set their own portal password from the order
confirmation (thank-you) page, gated by their Stripe checkout session id.

Run once in the Neon SQL editor before deploying the set-password flow.

```sql
alter table if exists users
  add column if not exists password_set_by_customer boolean default false;

update users set password_set_by_customer = false where password_set_by_customer is null;
```

## What it powers
- `collections/Users.ts` — new `passwordSetByCustomer` checkbox (admin-only field update).
- `app/(frontend)/api/portal/set-password/route.ts` — verifies the Stripe session is **paid**,
  reads the buyer email from Stripe, finds the matching user, and sets the password **once**
  (refuses if `password_set_by_customer` is already true → tells them to sign in).
- `app/components/SetPasswordCard.tsx` + thank-you page — the customer creates a password
  immediately after purchase.

## Notes
- The session id is a one-time capability proof; the client never chooses which account is changed.
- After Mailjet is live, add an emailed set-password / reset link as a second path. This page
  flow remains useful for the immediate post-purchase moment.
