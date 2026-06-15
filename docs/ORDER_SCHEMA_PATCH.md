# Order Schema Patch — Stripe Checkout Purchase Data

This project is currently using temporary setup/repair routes instead of full Payload migrations. Because the Orders collection now stores richer Stripe purchase data, Neon may need the matching columns added manually before the webhook/fallback fulfillment route can write complete order records.

Run this once in the Neon SQL editor if Stripe webhook fulfillment fails because order columns are missing.

```sql
alter table if exists orders
  add column if not exists customer_name varchar,
  add column if not exists customer_phone varchar,
  add column if not exists stripe_customer_id varchar,
  add column if not exists subtotal numeric default 0,
  add column if not exists tax_total numeric default 0,
  add column if not exists shipping_total numeric default 0,
  add column if not exists discount_total numeric default 0,
  add column if not exists item_count numeric default 0,
  add column if not exists items_summary varchar,
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

## What the new order record should show

A completed Stripe checkout should now write the important purchase details directly to the Order record:

```txt
Order number
Linked customer
Customer name
Customer email
Customer phone
Stripe checkout session ID
Stripe payment intent ID
Stripe customer ID
Subtotal
Tax total
Shipping total
Discount total
Final total
Currency
Item count
Purchased items summary
Billing address fields
Shipping address fields, when applicable
```

Order Details should still be created in `order-items` as the line-item source of truth.

## Customer purchase history

Customer records use a Payload join field named `purchaseHistory` that points back to Orders through the existing `orders.customer` relationship. New Stripe purchases should appear on the customer file after fulfillment creates the order and links it to the customer.

No separate manual purchase-history table should be created. The customer purchase history should come from linked Orders so the customer file and order records stay tied together.

## Test after this patch

After this is run, test Stripe sandbox checkout again and watch the Vercel function logs for:

```txt
Stripe checkout fulfillment completed
```

Expected Payload admin places to check:

```txt
/admin/collections/orders
/admin/collections/orders/:id
/admin/collections/order-items
/admin/collections/users?where[role][equals]=customer
/admin/collections/users/:id
/admin/collections/customer-addresses
/admin/collections/access-grants
/admin/collections/downloads
```

Notes:

- Billing address is required in Stripe Checkout.
- Shipping address is requested only when the cart contains Paperback or Hardcover.
- Stripe Automatic Tax is enabled in the Checkout Session. Stripe Automatic Tax must also be enabled/configured in the Stripe account for taxes to calculate.
- This SQL patch is temporary. Replace setup/repair SQL with proper Payload migrations before production launch.
