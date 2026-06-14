# Payload Locked Documents Schema Patch

Payload admin document pages use the `payload_locked_documents` and `payload_locked_documents_rels` tables to check whether a document is currently locked by another admin session.

If a collection was added after the original Payload tables were created, the relationship table can be missing columns for newer collections. When that happens, collection list pages may still load, but individual document pages can render blank.

## Current symptom

Opening an order detail page such as:

```txt
/admin/collections/orders/10
```

can fail with a Vercel/Neon log like:

```txt
column payload_locked_documents_rels.privacy_requests_id does not exist
```

The query is Payload checking locked documents across all collections.

## One-time Neon SQL patch

Run this once in the Neon SQL editor.

```sql
alter table if exists payload_locked_documents_rels
  add column if not exists privacy_requests_id integer,
  add column if not exists consent_logs_id integer,
  add column if not exists customer_addresses_id integer,
  add column if not exists contact_submissions_id integer,
  add column if not exists order_items_id integer,
  add column if not exists downloads_id integer,
  add column if not exists support_messages_id integer,
  add column if not exists access_grants_id integer,
  add column if not exists audit_logs_id integer;

create index if not exists payload_locked_documents_rels_privacy_requests_idx
  on payload_locked_documents_rels (privacy_requests_id);

create index if not exists payload_locked_documents_rels_consent_logs_idx
  on payload_locked_documents_rels (consent_logs_id);

create index if not exists payload_locked_documents_rels_customer_addresses_idx
  on payload_locked_documents_rels (customer_addresses_id);

create index if not exists payload_locked_documents_rels_contact_submissions_idx
  on payload_locked_documents_rels (contact_submissions_id);

create index if not exists payload_locked_documents_rels_order_items_idx
  on payload_locked_documents_rels (order_items_id);

create index if not exists payload_locked_documents_rels_downloads_idx
  on payload_locked_documents_rels (downloads_id);

create index if not exists payload_locked_documents_rels_support_messages_idx
  on payload_locked_documents_rels (support_messages_id);

create index if not exists payload_locked_documents_rels_access_grants_idx
  on payload_locked_documents_rels (access_grants_id);

create index if not exists payload_locked_documents_rels_audit_logs_idx
  on payload_locked_documents_rels (audit_logs_id);
```

## Verify

After running the patch, refresh:

```txt
/admin/collections/orders/10
```

Expected result:

- The order detail/editor page renders instead of staying blank.
- The Vercel log no longer shows `privacy_requests_id does not exist`.
- If another missing column appears, add it to the same table using the same pattern.

## Notes

- This project currently uses manual Neon SQL patches instead of full Payload migrations.
- This patch does not alter order data.
- This only adds missing relationship columns/indexes used by Payload's admin document-locking system.
- Replace manual repair SQL with proper Payload migrations before production launch.
