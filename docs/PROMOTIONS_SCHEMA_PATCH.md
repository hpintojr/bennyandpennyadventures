# Promotions Schema Patch

Adds the `promotions` collection — admin discount codes synced to Stripe coupons +
promotion codes. Customers enter them at checkout (checkout already sets
`allow_promotion_codes: true`). Gift codes are separate and start with `BPG`.

Run once in the Neon SQL editor before deploying.

```sql
create table if not exists promotions (
  id serial primary key,
  code varchar not null unique,
  discount_type varchar not null default 'percent',
  amount numeric,
  currency varchar default 'usd',
  active boolean default true,
  max_redemptions numeric,
  times_redeemed numeric default 0,
  expires_at timestamp(3) with time zone,
  notes varchar,
  stripe_coupon_id varchar,
  stripe_promotion_code_id varchar,
  sync_status varchar,
  updated_at timestamp(3) with time zone not null default now(),
  created_at timestamp(3) with time zone not null default now()
);
```

> If you let Payload create tables automatically in your environment, you can skip the
> manual SQL — but the project has been using explicit Neon patches, so this matches that flow.
> Also add the Payload locked-document relation column if your setup tracks it (see
> `PAYLOAD_LOCKED_DOCUMENTS_SCHEMA_PATCH.md` for the pattern), pointing at `promotions`.

## How it works
- `collections/Promotions.ts` — fields + `afterChange`/`afterDelete` hooks.
- `lib/promotions.ts` — on first save, creates a Stripe **Coupon** (`percent_off` or
  `amount_off`) + **Promotion Code** (the human code), writes the ids back, sets
  `syncStatus`. On later edits, keeps the promo code's `active` flag in sync. On delete,
  deactivates the Stripe promotion code.
- Validation: codes can't start with `BPG` (reserved for gifts); 3–40 chars `[A-Za-z0-9_-]`.

## Test after deploy
1. Admin → **Promotions** → Create: code `WELCOME10`, percent, amount `10`, active.
2. Save → confirm `syncStatus = synced` and the Stripe ids populate (check Stripe Dashboard → Coupons / Promotion codes).
3. At checkout, click "Add promotion code", enter `WELCOME10` → 10% comes off.
4. Toggle `active` off → save → the code stops working at checkout.
