import { bookFormats, books } from "@/lib/books";

export type CheckoutCartItemInput = {
  slug?: unknown;
  format?: unknown;
  qty?: unknown;
};

export type ValidatedCheckoutItem = {
  slug: string;
  title: string;
  formatLabel: string;
  shortLabel: string;
  unitAmount: number;
  quantity: number;
};

const formatAliases: Record<string, string> = {
  "pdf / epub": "PDF / EPUB",
  digital: "PDF / EPUB",
  audiobook: "Audiobook",
  audio: "Audiobook",
  paperback: "Paperback",
  hardcover: "Hardcover"
};

function normalizeFormat(format: unknown) {
  if (typeof format !== "string") return null;
  return formatAliases[format.trim().toLowerCase()] || format.trim();
}

function normalizeQuantity(qty: unknown) {
  const value = typeof qty === "number" ? qty : Number(qty);
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(10, Math.floor(value)));
}

export function validateCheckoutItems(items: CheckoutCartItemInput[]): ValidatedCheckoutItem[] {
  const validatedItems: ValidatedCheckoutItem[] = [];

  for (const item of items) {
    if (typeof item.slug !== "string") continue;

    const book = books.find((entry) => entry.slug === item.slug);
    if (!book) continue;

    const formatLabel = normalizeFormat(item.format);
    const format = bookFormats.find((entry) => entry.label === formatLabel || entry.shortLabel === formatLabel);
    if (!format) continue;

    validatedItems.push({
      slug: book.slug,
      title: book.title,
      formatLabel: format.label,
      shortLabel: format.shortLabel,
      unitAmount: Math.round(format.price * 100),
      quantity: normalizeQuantity(item.qty)
    });
  }

  return validatedItems;
}

export function cartRequiresShipping(items: ValidatedCheckoutItem[]) {
  return items.some((item) => item.shortLabel === "Paperback" || item.shortLabel === "Hardcover");
}

export function buildOrderMetadata(items: ValidatedCheckoutItem[]) {
  return {
    source: "benny-penny-web-cart",
    itemCount: String(items.reduce((total, item) => total + item.quantity, 0)),
    requiresShipping: String(cartRequiresShipping(items)),
    slugs: items.map((item) => item.slug).join(","),
    formats: items.map((item) => item.shortLabel).join(",")
  };
}
