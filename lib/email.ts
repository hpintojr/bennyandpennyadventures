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
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>img.an1,.an1{height:.75em!important;width:.75em!important;vertical-align:middle!important;}</style></head><body style="margin:0;background:#fdf6ec;font-family:Arial,Helvetica,sans-serif;color:#3c3c3c;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="text-align:center;padding:10px 0 18px;line-height:1.1;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:700;letter-spacing:.2px;color:#1f5c5f;">Benny &amp; Penny</div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#e86e6e;margin-top:4px;"><span style="display:inline-block;font-size:.75em;line-height:1;vertical-align:middle;">♥</span> Adventures <span style="display:inline-block;font-size:.75em;line-height:1;vertical-align:middle;">♥</span></div>
      <div style="font-size:11px;letter-spacing:1.8px;color:#9C7E5E;text-transform:uppercase;margin-top:9px;white-space:nowrap;">Medical&nbsp;books&nbsp;for&nbsp;brave&nbsp;little&nbsp;hearts</div>
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
  gifterEmail?: string;
  message?: string;
  expiresAt?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const redeemUrl = `${siteUrl()}/gift/redeem?code=${encodeURIComponent(opts.code)}`;
  const expires = opts.expiresAt ? new Date(opts.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;
  const gifter = opts.gifterName || opts.gifterEmail || "";
  const who = gifter ? `${escapeHtml(gifter)} sent you a gift!` : "You've been sent a gift!";
  const fromContact = [opts.gifterName, opts.gifterEmail].filter(Boolean).map((v) => escapeHtml(v as string)).join(" · ");
  const fromLine = fromContact ? `<p style="font-size:14px;color:#3c3c3c;margin:0 0 10px;">From <strong>${fromContact}</strong></p>` : "";
  const note = opts.message ? `<p style="background:#fdf6ec;border-radius:12px;padding:12px 14px;font-style:italic;color:#3c3c3c;">“${escapeHtml(opts.message)}”</p>` : "";
  const item = opts.bookTitle ? `<p style="font-size:15px;"><strong>${escapeHtml(opts.bookTitle)}</strong>${opts.formatLabel ? ` — ${escapeHtml(opts.formatLabel)}` : ""}</p>` : "";

  const inner = `
    <h1 style="font-size:22px;color:#1f5c5f;margin:0 0 8px;">${who} ♥</h1>
    ${fromLine}
    <p style="font-size:15px;line-height:1.6;">${gifter ? `${escapeHtml(gifter)} gifted you` : "You've been gifted"} a free Benny &amp; Penny digital book. Tap below to create your free account and claim it.</p>
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
    subject: opts.gifterName ? `${opts.gifterName} sent you a Benny & Penny book 🎁` : "🎁 A Benny & Penny book is waiting for you",
    preview: opts.gifterName ? `${opts.gifterName} gifted you a Benny & Penny book — claim your free copy.` : "You've been gifted a Benny & Penny book — claim your free copy.",
    html: layout(inner)
  });
}

export async function sendOrderReceiptEmail(opts: {
  to: string;
  orderNumber: string;
  items: { title: string; formatLabel: string; quantity: number; lineTotal: number }[];
  total: number;
  sessionId?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const rows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #f0e7d8;">${escapeHtml(i.title)} — ${escapeHtml(i.formatLabel)} × ${i.quantity}</td><td style="padding:6px 0;border-bottom:1px solid #f0e7d8;text-align:right;white-space:nowrap;">$${i.lineTotal.toFixed(2)}</td></tr>`
    )
    .join("");
  const setupBlock = opts.sessionId
    ? `<div style="text-align:center;margin:22px 0 6px;"><a href="${siteUrl()}/thank-you?session_id=${encodeURIComponent(opts.sessionId)}" style="display:inline-block;background:#e86e6e;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 26px;border-radius:999px;">Set up your account &amp; access your books</a></div>`
    : "";
  const inner = `
    <h1 style="font-size:22px;color:#1f5c5f;margin:0 0 6px;">Thank you for your order ♥</h1>
    <p style="font-size:14px;color:#6b7d80;margin:0 0 16px;">Order #${escapeHtml(opts.orderNumber)}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">${rows}
      <tr><td style="padding:10px 0;font-weight:bold;">Total</td><td style="padding:10px 0;text-align:right;font-weight:bold;">$${opts.total.toFixed(2)}</td></tr>
    </table>
    ${setupBlock}
    <p style="font-size:13px;color:#6b7d80;margin-top:16px;">You can view your orders and access your books any time in your <a href="${siteUrl()}/portal" style="color:#1f5c5f;">Customer Portal</a>.</p>`;
  return sendEmail({
    to: opts.to,
    subject: `Your Benny & Penny order #${opts.orderNumber}`,
    preview: "Thanks for your order — set up your account to access your books.",
    html: layout(inner)
  });
}

export async function sendGiftRedeemedEmail(opts: { to: string; code: string; bookTitle?: string }): Promise<{ ok: boolean; error?: string }> {
  const inner = `
    <h1 style="font-size:22px;color:#1f5c5f;margin:0 0 8px;">Your gift was claimed ♥</h1>
    <p style="font-size:15px;line-height:1.6;">Good news — your gift code <strong style="font-family:'Courier New',monospace;">${escapeHtml(opts.code)}</strong>${
      opts.bookTitle ? ` for <strong>${escapeHtml(opts.bookTitle)}</strong>` : ""
    } was just redeemed. Thank you for sharing Benny &amp; Penny with someone you care about!</p>`;
  return sendEmail({
    to: opts.to,
    subject: "Your Benny & Penny gift was claimed 🎁",
    preview: "Someone just redeemed the gift you sent.",
    html: layout(inner)
  });
}

// Adds/updates a Sequenzy subscriber (auto-creates). Used to catalogue leads. Fails soft.
export async function upsertSubscriber(opts: {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  customAttributes?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isEmailConfigured()) return { ok: false, error: "email-not-configured" };
  try {
    const response = await fetch(`${API_BASE}/subscribers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SEQUENZY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: opts.email,
        firstName: opts.firstName,
        lastName: opts.lastName,
        tags: opts.tags,
        customAttributes: opts.customAttributes
      })
    });
    const data = (await response.json().catch(() => null)) as { success?: boolean; error?: string } | null;
    if (!response.ok || data?.success === false) return { ok: false, error: data?.error || `HTTP ${response.status}` };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "subscriber-failed" };
  }
}

export async function sendPasswordLinkEmail(opts: {
  to: string;
  link: string;
  mode: "setup" | "reset";
}): Promise<{ ok: boolean; error?: string }> {
  const isReset = opts.mode === "reset";
  const heading = isReset ? "Reset your password" : "Finish setting up your account ♥";
  const lead = isReset
    ? "We received a request to reset your Benny &amp; Penny password. Tap below to choose a new one."
    : "Thanks for joining Benny &amp; Penny's Adventures! Tap below to create your password and unlock your Customer Portal — orders, addresses, and book downloads in one place.";
  const cta = isReset ? "Reset my password" : "Create my password";
  const inner = `
    <h1 style="font-size:22px;color:#1f5c5f;margin:0 0 8px;">${heading}</h1>
    <p style="font-size:15px;line-height:1.6;">${lead}</p>
    <div style="text-align:center;margin:22px 0 6px;">
      <a href="${opts.link}" style="display:inline-block;background:#e86e6e;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;">${cta}</a>
    </div>
    <p style="font-size:13px;color:#6b7d80;margin-top:14px;">Or paste this link:<br><span style="color:#1f5c5f;">${opts.link}</span></p>
    <p style="font-size:12px;color:#9aa0a0;margin-top:14px;">This link expires in 48 hours. If you didn't request this, you can safely ignore this email.</p>`;
  return sendEmail({
    to: opts.to,
    subject: isReset ? "Reset your Benny & Penny password" : "Finish setting up your Benny & Penny account",
    preview: isReset ? "Choose a new password." : "Create your password to access your books.",
    html: layout(inner)
  });
}
