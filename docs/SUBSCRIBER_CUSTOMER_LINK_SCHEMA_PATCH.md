# Subscriber Customer Link Schema Patch

This patch supports tracking whether a newsletter subscriber has become a customer and linking the subscriber record back to the customer/user record.

Run this in the production Neon SQL editor after the Subscriber collection change is deployed, if the columns do not already exist.

```sql
alter table if exists subscribers
  add column if not exists customer_status varchar default 'subscriber-only',
  add column if not exists linked_customer_id integer,
  add column if not exists became_customer_at timestamp with time zone,
  add column if not exists last_purchase_at timestamp with time zone,
  add column if not exists last_order_id integer,
  add column if not exists lifetime_order_count numeric default 0,
  add column if not exists lifetime_spend numeric default 0;
```

## Verify

```sql
select column_name
from information_schema.columns
where table_name = 'subscribers'
  and column_name in (
    'customer_status',
    'linked_customer_id',
    'became_customer_at',
    'last_purchase_at',
    'last_order_id',
    'lifetime_order_count',
    'lifetime_spend'
  )
order by column_name;
```

Expected result: 7 rows.

## Admin behavior intended

Subscriber records should show:

- Email.
- Marketing opt-in status.
- Customer status: Subscriber only or Customer.
- Linked customer record.
- Became customer date.
- Last purchase date.
- Last order.
- Lifetime order count.
- Lifetime spend.

Customer/User records should show a Subscriber / Marketing Profile join back to any subscriber record linked through `subscribers.linkedCustomer`.

## Automation still needed

When Stripe fulfillment creates a paid order, it should:

1. Look up a subscriber by the same email address.
2. If found, update that subscriber:
   - `linkedCustomer`
   - `customerStatus = customer`
   - `becameCustomerAt` if not already set
   - `lastPurchaseAt`
   - `lastOrder`
   - `lifetimeOrderCount`
   - `lifetimeSpend`
3. Do not create a new subscriber record unless the customer gave email marketing opt-in consent.

When newsletter signup happens, it should:

1. Look up an existing customer/user by email.
2. If found, link the subscriber record to that customer.
3. Mark `customerStatus = customer`.
4. Pull order count/spend from existing orders if available.

This keeps customer/subscriber segmentation clear while preserving consent rules.
