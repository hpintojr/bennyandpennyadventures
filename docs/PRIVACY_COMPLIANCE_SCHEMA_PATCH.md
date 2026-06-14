# Privacy Compliance Schema Patch

This patch adds the new admin-backed privacy compliance tables:

- `privacy_requests`
- `consent_logs`

Run this once in Neon SQL editor before relying on the new Privacy Requests and Consent Logs admin collections.

```sql
create table if not exists privacy_requests (
  id serial primary key,
  request_type varchar not null,
  state varchar not null,
  name varchar not null,
  email varchar not null,
  phone varchar,
  message text not null,
  status varchar not null default 'new',
  verification_status varchar default 'not-started',
  contact_consent boolean not null default false,
  submitted_at timestamptz,
  request_ip_address varchar,
  request_user_agent text,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists consent_logs (
  id serial primary key,
  source varchar not null,
  consent_type varchar not null,
  name varchar,
  email varchar,
  phone varchar,
  opt_in boolean default true,
  consent_text text,
  source_path varchar,
  ip_address varchar,
  user_agent text,
  related_collection varchar,
  related_id varchar,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists privacy_requests_email_idx on privacy_requests (email);
create index if not exists privacy_requests_status_idx on privacy_requests (status);
create index if not exists privacy_requests_request_type_idx on privacy_requests (request_type);
create index if not exists consent_logs_email_idx on consent_logs (email);
create index if not exists consent_logs_phone_idx on consent_logs (phone);
create index if not exists consent_logs_consent_type_idx on consent_logs (consent_type);
create index if not exists consent_logs_source_idx on consent_logs (source);
```

Expected behavior after deploy:

- `/privacy/requests` includes a working privacy request form.
- Privacy requests are stored in `privacy_requests`.
- Consent events are stored in `consent_logs`.
- Contact form consent creates consent log records.
- Newsletter signup consent creates consent log records.
- Admin sidebar includes direct links to Privacy Requests and Consent Logs.
