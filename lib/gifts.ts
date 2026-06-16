// Gift code helpers. Codes are BPG + 2–5 random digits (5–8 chars total). The BPG
// prefix marks a code as a gift (admin discount codes never start with BPG).

export function generateGiftCode(): string {
  const len = 2 + Math.floor(Math.random() * 4); // 2..5 digits
  let digits = "";
  for (let i = 0; i < len; i += 1) digits += Math.floor(Math.random() * 10).toString();
  return `BPG${digits}`;
}

// Normalize an admin-entered custom code: uppercase, strip spaces, ensure a single BPG prefix.
export function normalizeGiftCode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, "");
  const withoutPrefix = cleaned.replace(/^BPG/, "");
  return `BPG${withoutPrefix}`;
}

export function isGiftCode(code: string): boolean {
  return /^BPG/i.test(code.trim());
}

// Digital price per format, used as the gift's value ceiling (same-or-lesser value rule).
export function digitalValueForFormat(format: "digital" | "audiobook"): number {
  return format === "audiobook" ? 21.99 : 15.99;
}

// Maps a giftable format to the download record's format + file extension.
export function giftDownloadDef(format: "digital" | "audiobook"): { format: "pdf" | "audiobook"; ext: string } {
  return format === "audiobook" ? { format: "audiobook", ext: "mp3" } : { format: "pdf", ext: "pdf" };
}
