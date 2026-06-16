import crypto from "node:crypto";

type PasswordTokenRecord = {
  id: string | number;
  expiresAt?: unknown;
  user?: unknown;
  [key: string]: unknown;
};

type PayloadLike = {
  create: (args: any) => Promise<any>;
  find: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
};

export function makeRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// Creates a stored, hashed token and returns the RAW token for the email link.
export async function createPasswordToken(
  payload: PayloadLike,
  userId: string | number,
  email: string | null | undefined,
  type: "setup" | "reset",
  ttlHours = 48
): Promise<string> {
  const raw = makeRawToken();
  await payload.create({
    collection: "password-tokens",
    data: {
      user: userId,
      email: email || undefined,
      type,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString()
    },
    overrideAccess: true
  });
  return raw;
}

// Validates + single-use-consumes a raw token. Returns the owning user id, or null.
export async function consumePasswordToken(
  payload: PayloadLike,
  raw: string
): Promise<{ userId: string | number } | null> {
  if (!raw || raw.length < 16) return null;
  const tokenHash = hashToken(raw);
  const res = (await payload.find({
    collection: "password-tokens",
    limit: 1,
    where: { and: [{ tokenHash: { equals: tokenHash } }, { usedAt: { exists: false } }] }
  })) as { docs?: PasswordTokenRecord[] };
  const rec = res.docs?.[0];
  if (!rec) return null;

  const expiresAt = typeof rec.expiresAt === "string" ? new Date(rec.expiresAt).getTime() : 0;
  if (expiresAt && expiresAt < Date.now()) return null;

  await payload.update({ collection: "password-tokens", id: rec.id, data: { usedAt: new Date().toISOString() }, overrideAccess: true });

  const userVal = rec.user as unknown;
  const userId = typeof userVal === "object" && userVal ? (userVal as { id: string | number }).id : (userVal as string | number);
  return { userId };
}

export function passwordSetupUrl(raw: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");
  return `${base}/account/set-password?token=${encodeURIComponent(raw)}`;
}
