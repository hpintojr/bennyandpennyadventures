# Contact Opt-In Schema Patch

The contact form now captures phone, email opt-in, SMS opt-in, and consent proof details.

Run this once in Neon SQL editor before relying on stored contact consent records.

```sql
alter table if exists contact_submissions
  add column if not exists phone varchar,
  add column if not exists contact_consent boolean default false not null,
  add column if not exists email_opt_in boolean default false,
  add column if not exists sms_opt_in boolean default false,
  add column if not exists sms_consent_text text,
  add column if not exists consent_timestamp timestamptz,
  add column if not exists consent_ip_address varchar,
  add column if not exists consent_user_agent text;
```

Expected contact form behavior:

- Contact consent is required before submission.
- Email opt-in is optional.
- SMS opt-in is optional and requires a phone number.
- SMS disclosure shown on the form includes message frequency, message/data rates, STOP, HELP, and consent-not-required language.
- Consent proof is saved with timestamp, IP address, user agent, and accepted disclosure text when available.
