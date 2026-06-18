import { sendEmail } from "@/lib/email";

type CartReminderKind = "first" | "second";

type CartReminderItem = {
  title: string;
  format?: string;
  qty?: number;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

function money(value: number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export async function sendCartRecoveryEmail(opts: {
  to: string;
  recoveryUrl: string;
  items: CartReminderItem[];
  subtotal: number;
  kind: CartReminderKind;
  unsubscribeUrl: string;
}): Promise<{ ok: boolean; error?: string }> {
  const isSecond = opts.kind === "second";
  const itemRows = opts.items
    .slice(0, 4)
    .map((item) => `<li style="margin:0 0 7px;">${escapeHtml(item.title)}${item.format ? ` — ${escapeHtml(item.format)}` : ""}${item.qty && item.qty > 1 ? ` × ${item.qty}` : ""}</li>`)
    .join("");
  const subject = isSecond ? "A little reminder about your Benny & Penny cart ♥" : "Your Benny & Penny cart is waiting ♥";
  const lead = isSecond
    ? "Just a gentle reminder — the books you were looking at are still available when you are ready."
    : "It looks like you left a few brave-heart books in your cart. We saved the details so you can pick up where you left off.";

  const whiteCtaHeart = `<span class="bp-cta-heart" style="color:#ffffff !important;font-family:Arial,Helvetica,sans-serif;font-size:.75em;line-height:1;vertical-align:middle;">&#9829;&#65038;</span>`;

  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>img.an1,.an1{height:.75em!important;width:.75em!important;vertical-align:middle!important}.bp-cta-heart{color:#ffffff!important;font-family:Arial,Helvetica,sans-serif!important;font-size:.75em!important;line-height:1!important;vertical-align:middle!important}</style></head><body style="margin:0;background:#fdf6ec;font-family:Arial,Helvetica,sans-serif;color:#3c3c3c;"><div style="max-width:560px;margin:0 auto;padding:24px;"><div style="text-align:center;padding:10px 0 18px;line-height:1.1;"><div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:700;color:#1f5c5f;">Benny &amp; Penny</div><div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#e86e6e;margin-top:4px;">♥ Adventures ♥</div><div style="font-size:11px;letter-spacing:1.8px;color:#9C7E5E;text-transform:uppercase;margin-top:9px;">Medical books for brave little hearts</div></div><div style="background:#fff;border:1px solid #e6d9c4;border-radius:18px;padding:24px;"><h1 style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#1f5c5f;margin:0 0 10px;">Your cart is waiting ♥</h1><p style="font-size:15px;line-height:1.65;margin:0 0 16px;">${lead}</p><div style="background:#fdf6ec;border-radius:12px;padding:15px 16px;margin:16px 0;"><p style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9C7E5E;margin:0 0 8px;">Your saved selections</p><ul style="padding-left:20px;margin:0;font-size:14px;line-height:1.5;">${itemRows || "<li>Your selected Benny &amp; Penny book</li>"}</ul><p style="font-size:16px;font-weight:bold;color:#1f5c5f;margin:14px 0 0;text-align:right;">Cart total: ${money(opts.subtotal)}</p></div><div style="text-align:center;margin:22px 0 6px;"><a href="${opts.recoveryUrl}" style="display:inline-block;background:#e86e6e;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px;">Return to my cart ${whiteCtaHeart}</a></div><p style="font-size:12px;line-height:1.5;color:#6b7d80;margin:18px 0 0;">You received this reminder because you asked us to remind you about your cart. <a href="${opts.unsubscribeUrl}" style="color:#1f5c5f;">Stop cart reminders</a>.</p></div><p style="text-align:center;color:#9aa0a0;font-size:12px;margin-top:16px;">© Benny &amp; Penny&apos;s Adventures</p></div></body></html>`;

  return sendEmail({
    to: opts.to,
    subject,
    preview: isSecond ? "Your saved books are still waiting when you are ready." : "Pick up where you left off with your Benny & Penny cart.",
    html
  });
}
