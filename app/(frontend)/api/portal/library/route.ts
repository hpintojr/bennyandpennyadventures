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

type DownloadOption = {
  format: string;
  label: string;
  downloadId?: string | number | null;
  downloadable: boolean;
  status: string;
};

type LibraryFormat = {
  format: string;
  label: string;
  quantity: number;
  orderNumbers: string[];
  status: string;
  downloadId?: string | number | null;
  downloadable?: boolean;
  downloadOptions?: DownloadOption[];
};

type LibraryBook = {
  title: string;
  bookId?: string | number | null;
  formats: Map<string, LibraryFormat>;
  orderNumbers: Set<string>;
  latestPurchaseAt?: string;
  gifted?: boolean;
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

function downloadFormatLabel(value: string) {
  if (value === "pdf") return "PDF";
  if (value === "epub") return "EPUB";
  if (value === "audiobook") return "Audiobook";
  return value;
}

function accessStatus(format: string) {
  if (format === "digital") return "PDF and EPUB access pending";
  if (format === "audiobook") return "Audio access pending";
  if (format === "paperback" || format === "hardcover") return "Print order recorded";
  return "Purchased";
}

function isExpired(value: unknown) {
  const dateValue = getString(value);
  if (!dateValue) return false;
  return new Date(dateValue).getTime() < Date.now();
}

function fileState(dl: PayloadDoc, remaining: number | null): DownloadOption {
  const format = getString(dl.format) || "file";
  if (dl.isActive === false) return { format, label: downloadFormatLabel(format), downloadable: false, downloadId: dl.id, status: "Access paused" };
  if (isExpired(dl.accessExpiresAt)) return { format, label: downloadFormatLabel(format), downloadable: false, downloadId: dl.id, status: "Access expired" };
  if (remaining !== null && remaining <= 0) return { format, label: downloadFormatLabel(format), downloadable: false, downloadId: dl.id, status: "Access limit reached" };
  return {
    format,
    label: downloadFormatLabel(format),
    downloadId: dl.id,
    downloadable: true,
    status: remaining !== null ? `${remaining} readable slot${remaining === 1 ? "" : "s"} left` : "Ready to download"
  };
}

function readablePoolState(list: PayloadDoc[]) {
  const max = Math.max(...list.map((dl) => getNumber(dl.maxDownloads, 0)), 0) || null;
  const used = list.reduce((total, dl) => total + getNumber(dl.downloadsUsed, 0), 0);
  const gifts = list.reduce((total, dl) => total + getNumber(dl.giftsIssued, 0), 0);
  const remaining = max !== null ? Math.max(0, max - used - gifts) : null;
  return { max, used, gifts, remaining };
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

  const downloadRecords = (await payload.find({
    collection: "downloads",
    depth: 1,
    limit: 500,
    where: { customer: { equals: user.id } }
  })) as PayloadFindResult;

  const downloadsByBook = new Map<string, PayloadDoc[]>();
  for (const dl of downloadRecords.docs || []) {
    const dlBookId = getRelationId(dl.book);
    const k = `${dlBookId ?? ""}`;
    if (!downloadsByBook.has(k)) downloadsByBook.set(k, []);
    downloadsByBook.get(k)!.push(dl);
  }

  // Self-heal: a digital readable license covers BOTH PDF and EPUB. Older orders
  // may only have one record. If a book has at least one readable record but is
  // missing the sibling format, create it by mirroring the existing R2 key
  // (extension swapped) or the book's configured object key. Idempotent.
  for (const [bookKey, list] of Array.from(downloadsByBook.entries())) {
    if (!bookKey) continue;
    const readable = list.filter((dl) => ["pdf", "epub"].includes(getString(dl.format) || ""));
    if (!readable.length) continue;
    const present = new Set(readable.map((dl) => getString(dl.format)));
    const template = readable[0];
    const bookObj = template.book && typeof template.book === "object" ? (template.book as PayloadDoc) : null;
    const poolMax = Math.max(...readable.map((dl) => getNumber(dl.maxDownloads, 0)), 0) || 3;

    for (const fmt of ["pdf", "epub"] as const) {
      if (present.has(fmt)) continue;
      const fromBook = bookObj ? getString(bookObj[`${fmt}ObjectKey`]) : undefined;
      const templateKey = getString(template.r2ObjectKey);
      const swapped = templateKey ? templateKey.replace(/\.(pdf|epub)$/i, `.${fmt}`) : undefined;
      const objectKey = fromBook || (swapped && swapped !== templateKey ? swapped : undefined);
      if (!objectKey) continue;
      try {
        const titleStr = (bookObj && getString(bookObj.title)) || "Benny & Penny Book";
        const createdDoc = (await payload.create({
          collection: "downloads",
          data: {
            customer: user.id,
            order: getRelationId(template.order) || undefined,
            book: getRelationId(template.book) || undefined,
            fileLabel: `${titleStr} — ${fmt.toUpperCase()}`,
            format: fmt,
            r2ObjectKey: objectKey,
            maxDownloads: poolMax,
            downloadsUsed: 0,
            giftsIssued: 0,
            isActive: true
          }
        })) as PayloadDoc;
        list.push(createdDoc);
        present.add(fmt);
      } catch (error) {
        console.error("Library self-heal: could not create missing readable record", { bookKey, format: fmt, error });
      }
    }
  }

  // Include gifted/granted books: download records that have no matching
  // purchase (order-item). Gifts deliver via a downloads record only, so
  // without this they'd appear on the dashboard but not in the Library.
  for (const [bookKey, dls] of Array.from(downloadsByBook.entries())) {
    if (!bookKey || library.has(bookKey)) continue;
    const tmpl = dls[0];
    if (!tmpl) continue;
    const hasReadable = dls.some((d) => ["pdf", "epub"].includes(getString(d.format) || ""));
    const hasAudio = dls.some((d) => getString(d.format) === "audiobook");
    const formats = new Map<string, LibraryFormat>();
    if (hasReadable) formats.set("digital", { format: "digital", label: formatLabel("digital"), quantity: 1, orderNumbers: [], status: accessStatus("digital") });
    if (hasAudio) formats.set("audiobook", { format: "audiobook", label: formatLabel("audiobook"), quantity: 1, orderNumbers: [], status: accessStatus("audiobook") });
    if (!formats.size) continue;
    const title = getRelationTitle(tmpl.book) || (getString(tmpl.fileLabel) || "Benny & Penny Book").replace(/\s+—.*$/, "");
    library.set(bookKey, {
      title,
      bookId: getRelationId(tmpl.book),
      formats,
      orderNumbers: new Set<string>(),
      latestPurchaseAt: getString(tmpl.createdAt),
      gifted: true
    });
  }

  function readableOptions(bookKey: string): DownloadOption[] {
    const readable = (downloadsByBook.get(bookKey) || []).filter((dl) => ["pdf", "epub"].includes(getString(dl.format) || ""));
    if (!readable.length) return [];
    const pool = readablePoolState(readable);
    return readable
      .sort((a, b) => (getString(a.format) || "").localeCompare(getString(b.format) || ""))
      .map((dl) => fileState(dl, pool.remaining));
  }

  function audiobookOption(bookKey: string): DownloadOption | null {
    const audio = (downloadsByBook.get(bookKey) || []).find((dl) => getString(dl.format) === "audiobook");
    if (!audio) return null;
    const max = typeof audio.maxDownloads === "number" ? audio.maxDownloads : null;
    const used = getNumber(audio.downloadsUsed, 0);
    const gifts = getNumber(audio.giftsIssued, 0);
    const remaining = max !== null ? Math.max(0, max - used - gifts) : null;
    return fileState(audio, remaining);
  }

  function readableSummary(bookKey: string) {
    const readable = (downloadsByBook.get(bookKey) || []).filter((dl) => ["pdf", "epub"].includes(getString(dl.format) || ""));
    if (!readable.length) return null;
    const pool = readablePoolState(readable);
    if (pool.max === null) return null;
    return { total: pool.max, used: pool.used, gifts: pool.gifts, remaining: pool.remaining ?? 0 };
  }

  const books = Array.from(library.values()).map((book) => ({
    title: book.title,
    bookId: book.bookId,
    latestPurchaseAt: book.latestPurchaseAt,
    orderNumbers: Array.from(book.orderNumbers),
    gifted: Boolean(book.gifted),
    readable: readableSummary(`${book.bookId ?? ""}`),
    formats: Array.from(book.formats.values()).map((f): LibraryFormat => {
      if (f.format === "digital") {
        const options = readableOptions(`${book.bookId ?? ""}`);
        if (!options.length) return { ...f, downloadId: null, downloadable: false, status: "Digital files pending", downloadOptions: [] };
        const anyDownloadable = options.some((option) => option.downloadable);
        const readyStatus = anyDownloadable ? options[0]?.status || "Ready to download" : options[0]?.status || "Access unavailable";
        return { ...f, downloadId: options[0]?.downloadId || null, downloadable: anyDownloadable, status: readyStatus, downloadOptions: options };
      }

      if (f.format === "audiobook") {
        const option = audiobookOption(`${book.bookId ?? ""}`);
        if (!option) return { ...f, downloadId: null, downloadable: false, status: "Audio file pending", downloadOptions: [] };
        return { ...f, downloadId: option.downloadId || null, downloadable: option.downloadable, status: option.status, downloadOptions: [option] };
      }

      return { ...f, downloadId: null, downloadable: false };
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
