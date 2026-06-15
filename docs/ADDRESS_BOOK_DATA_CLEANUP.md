# Address Book One-Time Data Cleanup

Legacy rows in `customer_addresses` (created before the one-default-per-type rule existed)
can have **multiple default shipping / billing flags** and **exact-duplicate rows** from
checkout testing. Run this once in the Neon SQL editor. It is safe to re-run.

> It never deletes rows. Duplicates are soft-archived (`is_archived = true`) so any order
> snapshots that reference them are untouched.

---

## Step 0 — Look before you change (optional but recommended)

```sql
-- Customers with more than one default shipping or billing address
select customer_id,
       count(*) filter (where is_default_shipping) as default_shipping_count,
       count(*) filter (where is_default_billing)  as default_billing_count
from customer_addresses
where is_archived is not true
group by customer_id
having count(*) filter (where is_default_shipping) > 1
    or count(*) filter (where is_default_billing) > 1;

-- Exact-duplicate addresses (same customer + type + street + postal)
select customer_id, address_type, street1, postal_code, count(*) as copies
from customer_addresses
where is_archived is not true
group by customer_id, address_type, lower(coalesce(street1,'')), lower(coalesce(postal_code,''))
having count(*) > 1;
```

---

## Step 1 — Collapse multiple default shipping addresses

Keeps the **most recently updated** default shipping per customer, clears the rest.

```sql
update customer_addresses ca
set is_default_shipping = false
where ca.is_default_shipping = true
  and ca.is_archived is not true
  and ca.id <> (
    select c2.id
    from customer_addresses c2
    where c2.customer_id = ca.customer_id
      and c2.is_default_shipping = true
      and c2.is_archived is not true
    order by c2.updated_at desc, c2.id desc
    limit 1
  );
```

## Step 2 — Collapse multiple default billing addresses

```sql
update customer_addresses ca
set is_default_billing = false
where ca.is_default_billing = true
  and ca.is_archived is not true
  and ca.id <> (
    select c2.id
    from customer_addresses c2
    where c2.customer_id = ca.customer_id
      and c2.is_default_billing = true
      and c2.is_archived is not true
    order by c2.updated_at desc, c2.id desc
    limit 1
  );
```

## Step 3 — Archive exact-duplicate addresses

Keeps the newest row in each duplicate group (same customer + type + street1 + postal code),
archives the older copies. Distinct addresses (e.g. 1400 vs 1405 vs 1500 Pennsylvania Ave)
are different groups and are left alone — archive those by hand in the portal if they are
test data.

```sql
update customer_addresses
set is_archived = true,
    is_default_shipping = false,
    is_default_billing = false
where is_archived is not true
  and id not in (
    select max(id)
    from customer_addresses
    where is_archived is not true
    group by customer_id,
             address_type,
             lower(coalesce(street1, '')),
             lower(coalesce(postal_code, ''))
  );
```

---

## Step 4 — Verify

Re-run the Step 0 queries (both should return **0 rows**), then refresh `/portal/addresses`.
You should now see exactly one Default Shipping and one Default Billing card. Use the
**Set default shipping / Set default billing** buttons if you want a different address to be
the default, and **Archive** to remove any remaining distinct test addresses.
