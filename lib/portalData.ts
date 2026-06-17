import { headers as getHeaders } from "next/headers";
import { getPayload, type Where } from "payload";

export type PayloadDoc = { id: string | number; [key: string]: unknown };
export type PayloadFindResult = { docs?: PayloadDoc[] };

export async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

export async function getPortalAuth() {
  const payload = await getPayloadClient();
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadDoc | null | undefined;
  return { payload, user: user?.id ? user : null };
}

export function str(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function num(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function relId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

export function relTitle(value: unknown) {
  if (value && typeof value === "object" && "title" in value) {
    const t = (value as { title?: unknown }).title;
    if (typeof t === "string" && t.trim()) return t.trim();
  }
  return null;
}

/**
 * Match orders by the signed-in customer relationship OR by their email, so
 * older/backfilled Stripe orders still appear even without the relationship.
 */
export function customerOrderWhere(user: PayloadDoc): Where {
  const rawEmail = str(user.email) || "";
  const lowerEmail = rawEmail.toLowerCase();
  const emailConditions: Where[] = rawEmail
    ? [
        { customerEmail: { equals: rawEmail } },
        { customerEmail: { equals: lowerEmail } },
        { customerEmail: { like: rawEmail } },
        { customerEmail: { like: lowerEmail } }
      ]
    : [];
  return { or: [{ customer: { equals: user.id } }, ...emailConditions] };
}

/* ---------- Shared readable-license pool ----------
 * One purchased readable license = 3 total slots for a title, shared across
 * PDF downloads, EPUB downloads, and gifts. PDF + EPUB usage is summed.
 */
export type ReadablePool = { total: number | null; used: number; gifts: number; remaining: number | null };

export function readablePool(readableDownloads: PayloadDoc[]): ReadablePool {
  if (!readableDownloads.length) return { total: null, used: 0, gifts: 0, remaining: null };
  const total = Math.max(...readableDownloads.map((d) => num(d.maxDownloads, 0)), 0) || null;
  const used = readableDownloads.reduce((sum, d) => sum + num(d.downloadsUsed, 0), 0);
  const gifts = readableDownloads.reduce((sum, d) => sum + num(d.giftsIssued, 0), 0);
  const remaining = total !== null ? Math.max(0, total - used - gifts) : null;
  return { total, used, gifts, remaining };
}

/* ---------- Print fulfillment / shipment tracking ---------- */
export const FULFILLMENT_STAGES = ["submitted", "accepted", "shipped", "delivered"] as const;
export type FulfillmentStage = (typeof FULFILLMENT_STAGES)[number];

export type Shipment = {
  format: string;
  quantity: number;
  status: string;
  stage: FulfillmentStage | "preparing" | "issue";
  stageIndex: number;
  trackingNumber?: string;
  trackingUrl?: string;
  submittedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
};

const STATUS_TO_STAGE: Record<string, Shipment["stage"]> = {
  draft: "preparing",
  ready: "preparing",
  submitted: "submitted",
  accepted: "accepted",
  shipped: "shipped",
  delivered: "delivered",
  rejected: "issue",
  canceled: "issue",
  error: "issue"
};

export function shipmentFromPrintJob(job: PayloadDoc): Shipment {
  const status = str(job.status) || "draft";
  const stage = STATUS_TO_STAGE[status] || "preparing";
  const stageIndex = FULFILLMENT_STAGES.indexOf(stage as FulfillmentStage);
  return {
    format: str(job.format) || "print",
    quantity: num(job.quantity, 1),
    status,
    stage,
    stageIndex,
    trackingNumber: str(job.trackingNumber),
    trackingUrl: str(job.trackingUrl),
    submittedAt: str(job.submittedAt),
    shippedAt: str(job.shippedAt),
    deliveredAt: str(job.deliveredAt)
  };
}

/** Load print-job shipments for a set of order ids, grouped by order id. */
export async function shipmentsByOrder(
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  orderIds: (string | number)[]
): Promise<Map<string, Shipment[]>> {
  const map = new Map<string, Shipment[]>();
  if (!orderIds.length) return map;
  const jobs = (await payload.find({
    collection: "print-jobs",
    depth: 0,
    limit: 500,
    where: { order: { in: orderIds } }
  })) as PayloadFindResult;
  for (const job of jobs.docs || []) {
    const key = String(relId(job.order) ?? "");
    if (!key) continue;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(shipmentFromPrintJob(job));
  }
  return map;
}

/** A single human label summarizing where an order is in fulfillment. */
export function fulfillmentSummary(order: PayloadDoc, shipments: Shipment[]): string {
  if (shipments.length) {
    if (shipments.some((s) => s.stage === "issue")) return "Needs attention";
    if (shipments.every((s) => s.stage === "delivered")) return "Delivered";
    if (shipments.some((s) => s.stage === "shipped")) return "Shipped";
    if (shipments.some((s) => s.stage === "accepted")) return "In production";
    if (shipments.some((s) => s.stage === "submitted")) return "Sent to printer";
    return "Preparing";
  }
  const status = str(order.status);
  if (status === "paid" || status === "fulfilled") return "Digital — ready";
  if (status === "refunded") return "Refunded";
  if (status === "canceled") return "Canceled";
  return "Processing";
}
