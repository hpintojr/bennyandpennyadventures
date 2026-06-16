// Sequenzy transactional email. Direct-content sends (subject + HTML body), so no
// dashboard templates are required. Fails soft — callers never break if email is down.
// Docs: https://docs.sequenzy.com/api-reference/transactional/send

const API_BASE = (process.env.SEQUENZY_API_URL || "https://api.sequenzy.com/api/v1").replace(/\/$/, "");

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SEQUENZY_API_KEY);
}

function defaultFrom(): string | undefined {
  const email = process.env.SEQUENZY_FROM_EMAIL;
  const name = process.env.SEQUENZY_FROM_NAME;
  if (!email) return undefined;
  return name ? `${name} <${email}>` : email;
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://bennyandpennyadventures.com").replace(/\/$/, "");
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  preview?: string;
  from?: string;
  replyTo?: string;
};

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) return { ok: false, error: "email-not-configured" };
  try {
    const response = await fetch(`${API_BASE}/transactional/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SEQUENZY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: args.to,
        subject: args.subject,
        body: args.html,
        preview: args.preview,
        from: args.from || defaultFrom(),
        replyTo: args.replyTo
      })
    });
    const data = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
    if (!response.ok || data?.success === false) {
      return { ok: false, error: data?.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "send-failed" };
  }
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(bodyInner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#fdf6ec;font-family:Arial,Helvetica,sans-serif;color:#3c3c3c;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:8px 0 16px;">
      <div style="font-size:24px;font-weight:bold;color:#1f5c5f;">Benny &amp; Penny's Adventures</div>
      <div style="font-size:12px;letter-spacing:1px;color:#9C7E5E;text-transform:uppercase;">Medical books for brave little hearts</div>
    </div>
    <div style="background:#ffffff;border:1px solid #e6d9c4;border-radius:18px;padding:24px;">
      ${bodyInner}
    </div>
    <p style="text-align:center;color:#9aa0a0;font-size:12px;margin-top:16px;">© Benny &amp; Penny's Adventures. You received this because someone sent you a gift.</p>
  </div></body></html>`;
}

export async function sendGiftEmail(opts: {
  to: string;
  code: string;
  bookTitle?: string;
  formatLabel?: string;
  gifterName?: string;
  message?: string;
  expiresAt?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const redeemUrl = `${siteUrl()}/gift/redeem?code=${encodeURIComponent(opts.code)}`;
  const expires = opts.expiresAt ? new Date(opts.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
  const who = opts.gifterName ? `${escapeHtml(opts.gifterName)} sent you a gift!` : "You've been sent a gift!";
  const note = opts.message ? `<p style="background:#fdf6ec;border-radius:12px;padding:12px 14px;font-style:italic;color:#3c3c3c;">“${escapeHtml(opts.message)}”</p>` : "";
  const item = opts.bookTitle ? `<p style="font-size:15px;"><strong>${escapeHtml(opts.bookTitle)}</strong>${opts.formatLabel ? ` — ${escapeHtml(opts.formatLabel)}` : ""}</p>` : "";

  const inner = `
    <h1 style="font-size:22px;color:#1f5c5f;margin:0 0 8px;">${who} ♥</h1>
    <p style="font-size:15px;line-height:1.6;">You've been gifted a free Benny &amp; Penny digital book. Tap below to create your free account and claim it.</p>
    ${item}
    ${note}
    <p style="font-size:13px;color:#6b7d80;margin:18px 0 4px;text-transform:uppercase;letter-spacing:1px;">Your gift code</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:3px;color:#1f5c5f;margin:0 0 18px;font-family:'Courier New',monospace;">${escapeHtml(opts.code)}</p>
    <a href="${redeemUrl}" style="display:inline-block;background:#e86e6e;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;">Claim my free book ♥</a>
    <p style="font-size:13px;color:#6b7d80;margin-top:18px;">Or paste this link: <br><span style="color:#1f5c5f;">${redeemUrl}</span></p>
    ${expires ? `<p style="font-size:12px;color:#9aa0a0;margin-top:12px;">This gift expires on ${expires}.</p>` : ""}
  `;

  return sendEmail({
    to: opts.to,
    subject: "🎁 A Benny & Penny book is waiting for you",
    preview: "You've been gifted a Benny & Penny book — claim your free copy.",
    html: layout(inner)
  });
}
