# Password Tokens Schema Patch (Account setup + reset)

Adds the `password-tokens` collection that powers emailed account-setup and
password-reset links (hashed, single-use, 48h expiry).

Run once in the Neon SQL editor before deploying.

```sql
create table if not exists password_tokens (
  id serial primary key,
  user_id integer not null,
  email varchar,
  type varchar not null default 'setup',
  token_hash varchar not null,
  expires_at timestamp(3) with time zone not null,
  used_at timestamp(3) with time zone,
  updated_at timestamp(3) with time zone not null default now(),
  created_at timestamp(3) with time zone not null default now()
);
create index if not exists password_tokens_token_hash_idx on password_tokens (token_hash);
create index if not exists password_tokens_user_idx on password_tokens (user_id);

-- REQUIRED locked-documents relation column (new collection)
alter table if exists payload_locked_documents_rels
  add column if not exists password_tokens_id integer;
create index if not exists payload_locked_documents_rels_password_tokens_idx
  on payload_locked_documents_rels (password_tokens_id);
```

## New auth flow
- **After an order (new/unactivated account):** fulfillment emails a "Finish setting up your account" link (`/account/set-password?token=…`). The thank-you page now shows "Check your email" (new) or "Welcome back, sign in" (returning) instead of a password form.
- **Self-serve registration (no order):** `/register` → enter email → emailed a setup link.
- **Password reset:** `/forgot-password` → enter email → emailed a reset link. Both links land on `/account/set-password`.
- Login page now links to **Create an account** and **Forgot password?**.

## Security
- Tokens are random 256-bit, stored only as SHA-256 hashes, single-use, 48h expiry.
- Register/forgot endpoints are enumeration-safe (always return a generic success).
- Requires Sequenzy email configured (env + verified sender) to actually deliver.

## Test
1. `/register` with a new email → check inbox → click link → set password → sign in.
2. `/forgot-password` with that email → reset link → new password.
3. New checkout with a brand-new email → receipt + setup email; thank-you shows "Check your email".
4. Returning customer checkout → thank-you shows "Welcome back, sign in".
