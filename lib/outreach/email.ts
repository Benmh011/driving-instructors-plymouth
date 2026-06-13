import { Resend } from "resend";

// Dedicated cold-outreach sender, isolated on the `hello.` subdomain so its
// reputation can't affect transactional mail on the root domain.
const FROM =
  process.env.OUTREACH_FROM ||
  "Driving Instructors Plymouth <ben@hello.drivinginstructorsplymouth.com>";
const REPLY_TO = process.env.OUTREACH_REPLY_TO || undefined;

let client: Resend | null = null;
function resend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(key);
  }
  return client;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendOutreachEmail(opts: {
  to: string;
  subject: string;
  text: string;
  unsubscribeUrl: string;
}): Promise<string> {
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;color:#142436;white-space:pre-wrap">${escapeHtml(
    opts.text,
  )}</div>`;

  const { data, error } = await resend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    headers: {
      // One-click unsubscribe — required for good deliverability and compliance.
      "List-Unsubscribe": `<${opts.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) throw new Error(error.message || "Resend send failed");
  if (!data?.id) throw new Error("Resend returned no message id");
  return data.id;
}
