# Cloudflare R2 — Setup & Test Walkthrough

Private digital delivery for Benny & Penny. Paid PDF/EPUB/audiobook files live in a **private**
R2 bucket; customers only ever receive a short-lived presigned link generated server-side.

---

## Part 1 — Create the bucket

1. Cloudflare dashboard → **R2** → **Create bucket**.
2. Name it (e.g. `benny-penny-files`). Region: **Automatic**. Leave public access **OFF** (keep it private).
3. Note the bucket name — this is `R2_BUCKET_NAME`.

## Part 2 — Get your Account ID

- On the R2 overview page (right sidebar) copy **Account ID** → this is `R2_ACCOUNT_ID`.
  (Your S3 endpoint becomes `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.)

## Part 3 — Create an API token (S3 credentials)

1. R2 → **Manage R2 API Tokens** → **Create API token**.
2. Permissions: **Object Read & Write** (Read is enough for delivery, but Write lets you upload too).
3. Scope it to the single bucket from Part 1 (least privilege).
4. Create, then copy:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY` (shown once — save it now)

## Part 4 — Add env vars (Vercel + local `.env`)

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=benny-penny-files
R2_DOWNLOAD_EXPIRY_SECONDS=300
```

Add these in **Vercel → Project → Settings → Environment Variables** and in your local `.env`.
Never commit the real values.

## Part 5 — Install the new dependencies

```
npm install
```

(`package.json` now includes `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.)

---

## Part 6 — Test with a dummy file

1. **Upload a dummy file** to the bucket (Cloudflare dashboard → your bucket → **Upload**).
   Use a key like `books/book-1.pdf`. (Any small PDF works for testing.)
2. In **Payload admin → Media (downloads)** create a record:
   - **Customer:** your test customer user.
   - **Book:** any book.
   - **File label:** e.g. `Home Infusion Day — PDF`.
   - **Format:** `PDF`.
   - **R2 object key:** `books/book-1.pdf` (must match the upload key exactly).
   - **Max downloads:** `3`. **Is active:** ✓.
3. Note the **download record id** (in the admin URL).
4. Sign in to the portal as that customer, then visit:
   ```
   /api/portal/downloads?download_id=<RECORD_ID>
   ```
   You should get JSON like:
   ```json
   { "url": "https://<account>.r2.cloudflarestorage.com/...signed...", "filename": "Home Infusion Day — PDF.pdf", "expiresInSeconds": 300, "downloadsRemaining": 2 }
   ```
   Open `url` in the browser → the file downloads. `downloadsUsed` and `lastDownloadedAt` update on the record.

### What to confirm
- A signed-out user gets `401`.
- A different customer's download id gets `403`.
- After `maxDownloads` uses, you get `403` "download limit reached".
- An inactive or expired record is refused.

---

## Notes / next phase
- **Phase B (next):** wire the portal **My Library** buttons to call this endpoint (so customers click "Download" instead of hitting the URL), and **auto-create** download records on `checkout.session.completed` for digital/audiobook line items.
- Links expire after `R2_DOWNLOAD_EXPIRY_SECONDS` (default 5 min); the bucket itself stays private.
- Consider a folder convention in R2, e.g. `books/<slug>/<format>.<ext>`.
