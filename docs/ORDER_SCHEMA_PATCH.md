# Order Schema Patch — Stripe Checkout Address and Tax Fields

This project is currently using temporary setup/repair routes instead of full Payload migrations. Because the Orders collection now stores Stripe customer ID, subtotal, tax, shipping, billing address, and shipping address fields, Neon may need the matching columns added manually.

Run this once in the Neon SQL editor if Stripe webhook fulfillment fails because order columns are missing.

```sql
alter table if exists orders
  add column if not exists stripe_customer_id varchar,
  add column if not exists subtotal numeric default 0,
  add column if not exists tax_total numeric default 0,
  add column if not exists shipping_total numeric default 0,
  add column if not exists billing_address_name varchar,
  add column if not exists billing_address_line1 varchar,
  add column if not exists billing_address_line2 varchar,
  add column if not exists billing_address_city varchar,
  add column if not exists billing_address_state varchar,
  add column if not exists billing_address_postal_code varchar,
  add column if not exists billing_address_country varchar,
  add column if not exists shipping_address_name varchar,
  add column if not exists shipping_address_line1 varchar,
  add column if not exists shipping_address_line2 varchar,
  add column if not exists shipping_address_city varchar,
  add column if not exists shipping_address_state varchar,
  add column if not exists shipping_address_postal_code varchar,
  add column if not exists shipping_address_country varchar;
```

After this is run, test Stripe sandbox checkout again and watch the Vercel function logs for:

```txt
Stripe checkout fulfillment completed
```

Expected Payload collections to check:

```txt
/admin/collections/orders
/admin/collections/order-items
/admin/collections/access-grants
/admin/collections/downloads
```

Notes:

- Billing address is now required in Stripe Checkout.
- Shipping address is requested only when the cart contains Paperback or Hardcover.
- Stripe Automatic Tax is enabled in the Checkout Session. Stripe Automatic Tax must also be enabled/configured in the Stripe account for taxes to calculate.
- This SQL patch is temporary. Replace setup/repair SQL with proper Payload migrations before production launch.
