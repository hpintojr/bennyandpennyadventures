# Customer Address Schema Patch

The `customer-addresses` collection now stores whether each address is a billing address or a shipping address.

Run this once in Neon SQL editor before relying on the new field in production.

```sql
alter table if exists customer_addresses
  add column if not exists address_type varchar default 'billing' not null;

update customer_addresses
set address_type = case
  when is_default_shipping = true then 'shipping'
  else 'billing'
end
where address_type is null;
```

Expected behavior after deploy:

- Digital orders create a `billing` customer address from Stripe billing details.
- Physical orders create a `billing` address and, when Stripe returns it, a `shipping` address.
- Purchased items stay in `order_items`.
- Customer identity stays in `users`.
- Orders stay as the payment/order shell.
- Order `notes` are only for internal comments, not customer data storage.
