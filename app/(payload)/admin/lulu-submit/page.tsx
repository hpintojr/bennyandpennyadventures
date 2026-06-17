import config from "@payload-config";
import { headers as getHeaders } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import { LuluSubmitButton } from "../../components/LuluSubmitButton";
import "./page.scss";

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadUser = {
  id?: string | number;
  role?: string;
};

function getString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function relationLabel(value: unknown, fallback = "—") {
  if (typeof value === "string" || typeof value === "number") return String(value);
  const object = getObject(value);
  if (!object) return fallback;
  return getString(object.title) || getString(object.orderNumber) || getString(object.email) || String(object.id || fallback);
}

function formatDate(value: unknown) {
  if (typeof value !== "string") return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function statusClass(status: string) {
  if (status === "ready") return "is-ready";
  if (["submitted", "accepted", "shipped", "delivered"].includes(status)) return "is-submitted";
  if (status === "error" || status === "rejected") return "is-error";
  return "is-draft";
}

function shippingSummary(job: PayloadDoc) {
  const parts = [
    getString(job.shippingName),
    getString(job.shippingLine1),
    getString(job.shippingCity),
    getString(job.shippingState),
    getString(job.shippingPostalCode),
    getString(job.shippingCountry)
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "No shipping snapshot";
}

async function getAdminUser() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadUser | null | undefined;
  return { payload, user };
}

export default async function LuluSubmitPage() {
  const { payload, user } = await getAdminUser();

  if (user?.role !== "admin") {
    redirect("/admin/login");
  }

  const result = await payload.find({
    collection: "print-jobs",
    depth: 1,
    limit: 50,
    sort: "-createdAt"
  } as never);

  const jobs = (Array.isArray(result.docs) ? result.docs : []) as PayloadDoc[];
  const readyCount = jobs.filter((job) => getString(job.status) === "ready").length;
  const draftCount = jobs.filter((job) => getString(job.status) === "draft").length;
  const submittedCount = jobs.filter((job) => ["submitted", "accepted", "shipped", "delivered"].includes(getString(job.status))).length;

  return (
    <main className="bp-lulu-submit">
      <header className="bp-lulu-submit__hero">
        <p>LuLu POD Phase 3</p>
        <h1>Submit Ready Print Jobs to LuLu</h1>
        <span>Manual sandbox submission only. Auto-submit remains disabled.</span>
      </header>

      <section className="bp-lulu-submit__summary" aria-label="Print job summary">
        <article><strong>{readyCount}</strong><span>Ready</span></article>
        <article><strong>{draftCount}</strong><span>Draft</span></article>
        <article><strong>{submittedCount}</strong><span>Submitted / Accepted</span></article>
      </section>

      <section className="bp-lulu-submit__notice">
        <h2>Safety check</h2>
        <p>Only jobs with status <strong>Ready</strong> can be submitted. Draft jobs stay blocked until shipping and Book print setup are complete.</p>
      </section>

      <section className="bp-lulu-submit__list" aria-label="Print jobs">
        {jobs.length ? jobs.map((job) => {
          const id = String(job.id);
          const status = getString(job.status, "draft");
          const canSubmit = status === "ready";
          const luluId = getString(job.luluPrintJobId, "");

          return (
            <article className="bp-lulu-submit__job" key={id}>
              <div className="bp-lulu-submit__jobMain">
                <div>
                  <span className={`bp-lulu-submit__status ${statusClass(status)}`}>{status}</span>
                  <h2>{getString(job.title, `Print job ${id}`)}</h2>
                  <p>{shippingSummary(job)}</p>
                </div>
                <LuluSubmitButton disabled={!canSubmit || Boolean(luluId)} printJobId={id} status={status} />
              </div>

              <dl className="bp-lulu-submit__meta">
                <div><dt>Order</dt><dd>{relationLabel(job.order)}</dd></div>
                <div><dt>Book</dt><dd>{relationLabel(job.book)}</dd></div>
                <div><dt>Format</dt><dd>{getString(job.format, "—")}</dd></div>
                <div><dt>Qty</dt><dd>{getNumber(job.quantity, 1)}</dd></div>
                <div><dt>LuLu ID</dt><dd>{luluId || "Not submitted"}</dd></div>
                <div><dt>Created</dt><dd>{formatDate(job.createdAt)}</dd></div>
              </dl>

              {getString(job.errorMessage) ? <p className="bp-lulu-submit__error">{getString(job.errorMessage)}</p> : null}

              <div className="bp-lulu-submit__links">
                <Link href={`/admin/collections/print-jobs/${id}`}>Open print job</Link>
                <Link href="/admin/collections/print-jobs">View all print jobs</Link>
              </div>
            </article>
          );
        }) : <p className="bp-lulu-submit__empty">No print jobs yet.</p>}
      </section>
    </main>
  );
}
