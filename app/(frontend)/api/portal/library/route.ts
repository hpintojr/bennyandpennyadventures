import { headers as getHeaders } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

export const runtime = "nodejs";

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PayloadFindResult = {
  docs?: PayloadDoc[];
};

type LibraryFormat = {
  format: string;
  label: string;
  quantity: number;
  orderNumbers: string[];
  status: string;
  downloadId?: string | number | null;
  downloadable?: boolean;
};

type LibraryBook = {
  title: string;
  bookId?: string | number | null;
  formats: Map<string, LibraryFormat>;
  orderNumbers: Set<string>;
  latestPurchaseAt?: string;
};

async function getPayloadClient() {
  const { default: config } = await import("@payload-config");
  return getPayload({ config });
}

function getEmail(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown) {
  return getEmail(value).toLowerCase();
}

function getRelationId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") return id;
  }
  return null;
}

function getRelationTitle(value: unknown) {
  if (value && typeof value === "object" && "title" in value) {
    const title = (value as { title?: unknown }).title;
    if (typeof title === "string" && title.trim()) return title.trim();
  }
  return null;
}

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function emailConditions(rawEmail: string, userEmail: string) {
  if (!rawEmail) return [];
  return [
    { customerEmail: { equals: rawEmail } },
    { customerEmail: { equals: userEmail } },
    { customerEmail: { like: rawEmail } },
    { customerEmail: { like: userEmail } }
  ];
}

function formatLabel(value: string) {
  if (value === "digital") return "PDF / EPUB";
  if (value === "audiobook") return "Audiobook";
  if (value === "paperback") return "Paperback";
  if (value === "hardcover") return "Hardcover";
  return value;
}

function accessStatus(format: string) {
  if (format === "digital" || format === "audiobook") return "Digital access coming soon";
  if (format === "paperback" || format === "hardcover") return "Print order recorded";
  return "Purchased";
}

export async function GET() {
  const payload = await getPayloadClient();
  const headers = await getHeaders();
  const auth = await payload.auth({ headers });
  const user = auth.user as PayloadDoc | null | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawEmail = getEmail(user.email);
  const userEmail = normalizeEmail(user.email);
  const orders = (await payload.find({
    collection: "orders",
    depth: 0,
    limit: 100,
    sort: "-createdAt",
    where: {
      or: [
        {
          customer: {
            equals: user.id
          }
        },
        ...emailConditions(rawEmail, userEmail)
      ]
    }
  })) as PayloadFindResult;

  const orderDocs = orders.docs || [];
  const library = new Map<string, LibraryBook>();

  for (const order of orderDocs) {
    const items = (await payload.find({
      collection: "order-items",
      depth: 1,
      limit: 100,
      where: {
        order: {
          equals: order.id
        }
      }
    })) as PayloadFindResult;

    for (const item of items.docs || []) {
      const bookId = getRelationId(item.book);
      const title = getString(item.title) || getRelationTitle(item.book) || "Benny & Penny Book";
      const key = `${bookId || title}`;
      const format = getString(item.format) || "item";
      const orderNumber = getString(order.orderNumber) || String(order.id);
      const quantity = getNumber(item.quantity, 1);
      const purchaseAt = getString(order.createdAt);

      if (!library.has(key)) {
        library.set(key, {
          title,
          bookId,
          formats: new Map(),
          orderNumbers: new Set(),
          latestPurchaseAt: purchaseAt
        });
      }

      const book = library.get(key)!;
      book.orderNumbers.add(orderNumber);

      if (purchaseAt && (!book.latestPurchaseAt || new Date(purchaseAt) > new Date(book.latestPurchaseAt))) {
        book.latestPurchaseAt = purchaseAt;
      }

      const existingFormat = book.formats.get(format);
      if (existingFormat) {
        existingFormat.quantity += quantity;
        if (!existingFormat.orderNumbers.includes(orderNumber)) existingFormat.orderNumbers.push(orderNumber);
      } else {
        book.formats.set(format, {
          format,
          label: formatLabel(format),
          quantity,
          orderNumbers: [orderNumber],
          status: accessStatus(format)
        });
      }
    }
  }

  // Attach private R2 download records to digital/audiobook formats.
  const downloadRecords = (await payload.find({
    collection: "downloads",
    depth: 1,
    limit: 200,
    where: { customer: { equals: user.id } }
  })) as PayloadFindResult;

  const downloadsByBook = new Map<string, PayloadDoc[]>();
  for (const dl of downloadRecords.docs || []) {
    const dlBookId = getRelationId(dl.book);
    const k = `${dlBookId ?? ""}`;
    if (!downloadsByBook.has(k)) downloadsByBook.set(k, []);
    downloadsByBook.get(k)!.push(dl);
  }

  function pickDownload(bookKey: string, libFormat: string): PayloadDoc | null {
    const list = downloadsByBook.get(bookKey) || [];
    const wanted = libFormat === "digital" ? ["pdf", "epub"] : libFormat === "audiobook" ? ["audiobook"] : [];
    for (const fmt of wanted) {
      const match = list.find((d) => getString(d.format) === fmt);
      if (match) return match;
    }
    return null;
  }

  function downloadState(dl: PayloadDoc): { downloadable: boolean; status: string; id: string | number | null } {
    if (dl.isActive === false) return { downloadable: false, status: "Access paused", id: dl.id };
    const exp = getString(dl.accessExpiresAt);
    if (exp && new Date(exp).getTime() < Date.now()) return { downloadable: false, status: "Access expired", id: dl.id };
    const max = typeof dl.maxDownloads === "number" ? dl.maxDownloads : null;
    const used = getNumber(dl.downloadsUsed, 0);
    if (max !== null && used >= max) return { downloadable: false, status: "Download limit reached", id: dl.id };
    const remaining = max !== null ? Math.max(0, max - used) : null;
    return {
      downloadable: true,
      status: remaining !== null ? `Ready to download — ${remaining} left` : "Ready to download",
      id: dl.id
    };
  }

  const books = Array.from(library.values()).map((book) => ({
    title: book.title,
    bookId: book.bookId,
    latestPurchaseAt: book.latestPurchaseAt,
    orderNumbers: Array.from(book.orderNumbers),
    formats: Array.from(book.formats.values()).map((f): LibraryFormat => {
      if (f.format !== "digital" && f.format !== "audiobook") {
        return { ...f, downloadId: null, downloadable: false };
      }
      const dl = pickDownload(`${book.bookId ?? ""}`, f.format);
      if (!dl) return { ...f, downloadId: null, downloadable: false, status: "Digital file pending" };
      const st = downloadState(dl);
      return { ...f, downloadId: st.id, downloadable: st.downloadable, status: st.status };
    })
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    books
  });
}
