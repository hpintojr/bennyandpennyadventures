import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function getClient(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 storage environment variables are not configured.");
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey }
    });
  }

  return client;
}

// True only when every R2 setting is present, so callers can fail soft before launch.
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
  );
}

export function getDefaultExpirySeconds(): number {
  const raw = Number(process.env.R2_DOWNLOAD_EXPIRY_SECONDS);
  return Number.isFinite(raw) && raw > 0 ? Math.min(raw, 3600) : 300;
}

// Returns a short-lived, presigned GET URL for a private R2 object. The bucket stays
// private; only this time-limited link is ever exposed to the customer.
export async function getR2DownloadUrl(
  objectKey: string,
  options?: { expiresInSeconds?: number; downloadFilename?: string }
): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not configured.");

  const expiresIn = options?.expiresInSeconds ?? getDefaultExpirySeconds();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ...(options?.downloadFilename
      ? { ResponseContentDisposition: `attachment; filename="${options.downloadFilename.replace(/"/g, "")}"` }
      : {})
  });

  return getSignedUrl(getClient(), command, { expiresIn });
}
