type PayloadClient = {
  findByID: (args: Record<string, unknown>) => Promise<unknown>;
  update: (args: Record<string, unknown>) => Promise<unknown>;
};

type PayloadDoc = {
  id: string | number;
  [key: string]: unknown;
};

type PhysicalFormat = "paperback" | "hardcover";

type LuluConfig = {
  baseUrl: string;
  authPath: string;
  printJobsPath: string;
  authHeader: string;
  shippingLevel: string;
};

type LuluSubmitResult = {
  ok: boolean;
  status: "submitted" | "accepted" | "error";
  luluPrintJobId?: string;
  luluLineItemId?: string;
  response: unknown;
};

function envName(...parts: string[]) {
  return parts.join("_");
}

function getEnv(...parts: string[]) {
  return process.env[envName(...parts)]?.trim() || "";
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumber(value: unknown, fallback = 1) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getRelationObject(value: unknown): PayloadDoc | null {
  return value && typeof value === "object" && "id" in value ? value as PayloadDoc : null;
}

function isPhysicalFormat(value: unknown): value is PhysicalFormat {
  return value === "paperback" || value === "hardcover";
}

function joinUrl(baseUrl: string, path: string) {
  const cleanBase = baseUrl.replace(/\/+$/g, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function getLuluConfig(): LuluConfig {
  const baseUrl = getEnv("LULU", "BASE", "URL") || "https://api.sandbox.lulu.com";
  const authPath = getEnv("LULU", "AUTH", "PATH") || "/auth/realms/glasstree/protocol/openid-connect/token";
  const printJobsPath = getEnv("LULU", "PRINT", "JOBS", "PATH") || "/print-jobs/";
  const shippingLevel = getEnv("LULU", "SHIPPING", "LEVEL") || "MAIL";
  const providedBasic = getEnv("LULU", "BASIC", "AUTH");

  const authHeader = providedBasic
    ? `Basic ${providedBasic}`
    : `Basic ${Buffer.from(`${getEnv("LULU", "CLIENT", "KEY")}:${getEnv("LULU", "CLIENT", "SECRET")}`).toString("base64")}`;

  if (!providedBasic && (!getEnv("LULU", "CLIENT", "KEY") || !getEnv("LULU", "CLIENT", "SECRET"))) {
    throw new Error("LuLu credentials are not configured in Vercel env vars.");
  }

  return { baseUrl, authPath, printJobsPath, authHeader, shippingLevel };
}

async function getLuluAccessToken(config: LuluConfig) {
  const response = await fetch(joinUrl(config.baseUrl, config.authPath), {
    method: "POST",
    headers: {
      Authorization: config.authHeader,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || !getString((json as Record<string, unknown>).access_token)) {
    throw new Error(`LuLu auth failed with status ${response.status}: ${JSON.stringify(json)}`);
  }

  return String((json as Record<string, unknown>).access_token);
}

function formatSkuField(format: PhysicalFormat) {
  return format === "paperback" ? "luluPaperbackSku" : "luluHardcoverSku";
}

function collectMissingSetup(job: PayloadDoc, book: PayloadDoc | null, format: PhysicalFormat) {
  const missing: string[] = [];

  if (getString(job.status) !== "ready") missing.push("Print job status must be ready before submit.");
  if (!getString(job.customerEmail)) missing.push("Missing customer email.");
  if (!getString(job.shippingName)) missing.push("Missing shipping name.");
  if (!getString(job.shippingLine1)) missing.push("Missing shipping address line 1.");
  if (!getString(job.shippingCity)) missing.push("Missing shipping city.");
  if (!getString(job.shippingState)) missing.push("Missing shipping state.");
  if (!getString(job.shippingPostalCode)) missing.push("Missing shipping postal code.");
  if (!getString(job.shippingCountry)) missing.push("Missing shipping country.");

  if (!book) {
    missing.push("Missing linked book/product record.");
    return missing;
  }

  if (!getString(book.luluProjectId)) missing.push("Missing LuLu project ID on book.");
  if (!getString(book[formatSkuField(format)])) missing.push(`Missing LuLu ${format} SKU/package ID on book.`);
  if (!getString(book.trimSize)) missing.push("Missing trim size on book.");
  if (!getString(book.printInteriorFileKey)) missing.push("Missing print interior file key or URL on book.");
  if (!getString(book.printCoverFileKey)) missing.push("Missing print cover file key or URL on book.");

  return missing;
}

function buildPrintJobRequest(job: PayloadDoc, book: PayloadDoc, format: PhysicalFormat, config: LuluConfig) {
  const packageId = getString(book[formatSkuField(format)]);
  const title = getString(job.title) || getString(book.title) || `Print job ${job.id}`;

  return {
    contact_email: getString(job.customerEmail),
    external_id: String(job.id),
    line_items: [
      {
        external_id: String(job.id),
        title,
        cover: getString(book.printCoverFileKey),
        interior: getString(book.printInteriorFileKey),
        pod_package_id: packageId,
        quantity: Math.max(1, getNumber(job.quantity, 1))
      }
    ],
    shipping_address: {
      name: getString(job.shippingName),
      street1: getString(job.shippingLine1),
      street2: getString(job.shippingLine2) || undefined,
      city: getString(job.shippingCity),
      state_code: getString(job.shippingState),
      postcode: getString(job.shippingPostalCode),
      country_code: getString(job.shippingCountry)
    },
    shipping_level: config.shippingLevel
  };
}

function extractLuluIds(response: unknown) {
  const body = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const id = getString(body.id) || getString(body.print_job_id) || getString(body.printJobId);
  const lineItems = Array.isArray(body.line_items) ? body.line_items : [];
  const firstLine = lineItems[0] && typeof lineItems[0] === "object" ? lineItems[0] as Record<string, unknown> : null;
  return {
    luluPrintJobId: id || undefined,
    luluLineItemId: firstLine ? getString(firstLine.id) || getString(firstLine.line_item_id) || undefined : undefined
  };
}

function mapSuccessfulStatus(response: unknown): "submitted" | "accepted" {
  const body = response && typeof response === "object" ? response as Record<string, unknown> : {};
  const rawStatus = getString(body.status) || getString((body.status as Record<string, unknown> | undefined)?.name);
  return rawStatus && ["accepted", "created", "production_ready"].includes(rawStatus.toLowerCase()) ? "accepted" : "submitted";
}

export async function submitPrintJobToLulu(payload: PayloadClient, printJobId: string | number): Promise<LuluSubmitResult> {
  const job = await payload.findByID({ collection: "print-jobs", id: printJobId, depth: 1 }) as PayloadDoc;
  const format = job.format;

  if (!isPhysicalFormat(format)) {
    throw new Error("Only paperback and hardcover print jobs can be submitted to LuLu.");
  }

  const book = getRelationObject(job.book);
  const missing = collectMissingSetup(job, book, format);

  if (missing.length) {
    const message = missing.join("\n");
    await payload.update({
      collection: "print-jobs",
      id: job.id,
      data: {
        errorMessage: message,
        notes: `${getString(job.notes) || ""}\n\nSubmit blocked:\n${message}`.trim()
      }
    });
    throw new Error(message);
  }

  const config = getLuluConfig();
  const requestBody = buildPrintJobRequest(job, book as PayloadDoc, format, config);

  await payload.update({
    collection: "print-jobs",
    id: job.id,
    data: {
      rawRequest: JSON.stringify(requestBody, null, 2),
      errorMessage: undefined
    }
  });

  try {
    const token = await getLuluAccessToken(config);
    const response = await fetch(joinUrl(config.baseUrl, config.printJobsPath), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = `LuLu submit failed with status ${response.status}: ${JSON.stringify(responseBody)}`;
      await payload.update({
        collection: "print-jobs",
        id: job.id,
        data: {
          status: "error",
          rawResponse: JSON.stringify(responseBody, null, 2),
          errorMessage: message
        }
      });
      return { ok: false, status: "error", response: responseBody };
    }

    const ids = extractLuluIds(responseBody);
    const status = mapSuccessfulStatus(responseBody);

    await payload.update({
      collection: "print-jobs",
      id: job.id,
      data: {
        status,
        luluPrintJobId: ids.luluPrintJobId,
        luluLineItemId: ids.luluLineItemId,
        rawResponse: JSON.stringify(responseBody, null, 2),
        submittedAt: new Date().toISOString(),
        errorMessage: undefined
      }
    });

    return { ok: true, status, ...ids, response: responseBody };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown LuLu submit error";
    await payload.update({
      collection: "print-jobs",
      id: job.id,
      data: {
        status: "error",
        errorMessage: message
      }
    });
    throw error;
  }
}
