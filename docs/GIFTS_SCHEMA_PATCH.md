# Gifts Schema Patch (Gifting Phase 2)

Adds the `gifts` collection plus the supporting columns. Customers gift a digital
download from their allowance; recipients redeem a `BPG…` code, sign up, and receive
the book through the existing R2 download path.

Run once in the Neon SQL editor before deploying.

```sql
-- 1) New columns on existing tables
alter table if exists downloads
  add column if not exists gifts_issued numeric not null default 0;

alter table if exists users
  add column if not exists acquired_via varchar default 'organic';

-- 2) Gifts table
create table if not exists gifts (
  id serial primary key,
  redemption_code varchar not null unique,
  status varchar not null default 'sent',
  gifter_id integer,
  source_download_id integer,
  source_book_id integer,
  format varchar not null default 'digital',
  value_ceiling numeric,
  downloads_granted numeric default 1,
  recipient_email varchar,
  message varchar,
  expires_at timestamp(3) with time zone,
  redeemed_by_id integer,
  redeemed_book_id integer,
  redeemed_download_id integer,
  redeemed_at timestamp(3) with time zone,
  updated_at timestamp(3) with time zone not null default now(),
  created_at timestamp(3) with time zone not null default now()
);
create index if not exists gifts_gifter_idx on gifts (gifter_id);
create index if not exists gifts_redeemed_by_idx on gifts (redeemed_by_id);

-- 3) REQUIRED locked-documents relation column (new collection)
alter table if exists payload_locked_documents_rels
  add column if not exists gifts_id integer;
create index if not exists payload_locked_documents_rels_gifts_idx
  on payload_locked_documents_rels (gifts_id);
```

## Behavior
- **Giftable balance** = `maxDownloads − downloadsUsed − giftsIssued` on a download. Creating a gift consumes a slot (`giftsIssued++`); revoking an unredeemed gift restores it.
- **Download endpoint** now stops personal downloads at `maxDownloads − giftsIssued`.
- **Codes:** `BPG` + 2–5 random digits, unique. Admins can also create gifts directly (auto or custom code) and track all of them in the Gifts admin.
- **Redemption** creates a one-download `downloads` record for the recipient (so it appears in their My Library and delivers via signed URL like any purchase), marks the gift `redeemed`, and — with consent — adds the recipient as a `subscribers` lead tagged `source: gift-redemption` + `users.acquired_via = gift`.
- **Expiry:** 90 days. **No re-gifting.**

## Test after deploy
1. As a customer who owns a digital download with slots left, go to **Portal → Gifts**, pick the book, enter a recipient email, **Create gift code** → a `BPG…` code appears; the source download's gift slot decrements.
2. Open `/gift/redeem?code=BPG…` in a private window → sign up with a new email → "Your book is ready".
3. Sign in as the recipient → the book is in **My Library** with one download.
4. Back as the gifter, confirm the gift shows **redeemed**; try a personal download on a fully-consumed license → blocked.
5. Revoke an unredeemed gift → slot returns.
