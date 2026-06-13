import { Resend } from "resend";

// Dedicated cold-outreach sender, isolated on the `hello.` subdomain so its
// reputation can't affect transactional mail on the root domain.
// Sent as PLAIN TEXT on purpose — a personal 1:1 email is far more likely to
// land in Primary than Promotions when there's no marketing-style HTML.
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

export async function sendOutreachEmail(opts: {
  to: string;
  subject: string;
  text: string;
  unsubscribeUrl: string;
}): Promise<string> {
  const { data, error } = await resend().emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    headers: {
      // One-click unsubscribe — keeps you compliant and gives recipients a
      // friction-free opt-out instead of hitting "spam".
      "List-Unsubscribe": `<${opts.unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) throw new Error(error.message || "Resend send failed");
  if (!data?.id) throw new Error("Resend returned no message id");
  return data.id;
}
