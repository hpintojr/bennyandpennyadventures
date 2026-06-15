# Address Book Schema Patch

The `customer-addresses` collection now powers a full customer **Address Book** in the portal: add/edit, set default shipping and default billing, archive, friendly labels, a combined "Billing & Shipping" type, and a last-used timestamp.

Run this once in the Neon SQL editor before relying on the new fields in production.

```sql
alter table if exists customer_addresses
  add column if not exists label varchar,
  add column if not exists is_default_billing boolean default false,
  add column if not exists is_archived boolean default false,
  add column if not exists last_used_at timestamp(3) with time zone;

-- Backfill flags so existing rows behave predictably.
update customer_addresses set is_default_billing = false where is_default_billing is null;
update customer_addresses set is_archived = false where is_archived is null;
```

`address_type` already exists (see `CUSTOMER_ADDRESS_SCHEMA_PATCH.md`). It now also accepts the value `both`. The column is a plain `varchar`, so no enum change is required — the new value is validated in Payload, not the database.

## What changed in code

- `collections/CustomerAddresses.ts` — added `label`, `isDefaultBilling`, `isArchived`, `lastUsedAt`; widened `addressType` to include `both`.
- `app/(frontend)/api/portal/addresses/route.ts` — now a full CRUD endpoint:
  - `GET` returns active (non-archived) saved addresses plus read-only `orderAddresses` snapshots that can be imported.
  - `POST` creates an address owned by the signed-in customer.
  - `PATCH` edits an address, or runs a lightweight `action` of `default-shipping`, `default-billing`, or `archive`.
  - `DELETE` soft-archives (never destroys) so order snapshots are untouched.
  - Every mutation verifies the address belongs to the signed-in customer.
  - Setting a default clears the same default flag on the customer's other addresses, so only one default of each kind exists.
- `app/components/PortalAddressesClient.tsx` — add/edit form, set-default, archive controls, and an "Import from past orders" section.

## Behavior notes

- **Frozen order snapshots are preserved.** Orders store their own billing/shipping address fields at purchase time. Editing or archiving an Address Book entry never rewrites a past order.
- **Archive, not delete.** Removing an address sets `is_archived = true`. It disappears from the active Address Book but remains in the database.
- **One default per type.** Setting a default shipping or default billing address automatically unsets the previous one for that customer.

## Still to wire (future)

- `last_used_at` is stored but not yet stamped during checkout — set it when an address is selected for a new order.
- Checkout does not yet let customers pick a saved Address Book entry; that pairs with the Lulu/POD shipping-rate flow.
