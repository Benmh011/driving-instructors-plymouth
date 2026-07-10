// Personalised first-contact draft. The agent generates one per prospect using
// their name and area, with a little deterministic variation so no two emails
// are byte-identical (better for deliverability and reads less like a campaign).
// You still edit and approve before anything sends. Honest and low-key on
// purpose — reads like a real person.

// Stable per-prospect index so the same prospect always gets the same variant.
function variantIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

export function buildDraft(prospect: { name: string; area: string | null }): {
  subject: string;
  body: string;
} {
  const name = (prospect.name ?? "").trim();
  const area = (prospect.area ?? "").trim();
  const place = area ? `around ${area}` : "around Plymouth and the South Hams";

  const subjects = [
    area
      ? `Quick idea for ${area} driving instructors`
      : "Quick idea for your driving school",
    "A booking & admin tool built for local instructors",
    "Built something for instructors near you",
  ];
  const subject = subjects[variantIndex(name + area, subjects.length)];

  const opener = name
    ? `Came across ${name} while listing instructors ${place} — thought this might be useful.`
    : `I work with instructors ${place} — thought this might be useful.`;

  const body = `Hi there,

${opener}

I'm local and I've built Driving Instructors Plymouth: your diary, students, payments and expenses in one app, plus theory practice for pupils and a profile on a directory learners search.

Founding instructors get it free until January 2027, then £9.99/month locked in for good (standard rate is £13.99). First 20 only.

Worth a 10-minute video call, or shall I send a demo link? If it's not for you, just say — no worries.

Best,
Gabe
Driving Instructors Plymouth
www.drivinginstructorsplymouth.com`;

  return { subject, body };
}

// Follow-up cadence. Cold outreach lives on the second and third touch, so we
// nudge prospects who were contacted at least FOLLOWUP_AFTER_DAYS ago and
// haven't replied, up to MAX_TOUCHES total emails (first contact + 2 follow-ups).
export const FOLLOWUP_AFTER_DAYS = 4;
export const MAX_TOUCHES = 3;

// A short, polite follow-up. `touch` is the email number (2 = first follow-up,
// 3 = final). The last allowed touch signs off and promises not to chase again.
export function buildFollowUp(
  prospect: { name: string; area: string | null },
  touch: number,
): { subject: string; body: string } {
  const area = (prospect.area ?? "").trim();
  const place = area ? `around ${area}` : "around Plymouth and the South Hams";
  const final = touch >= MAX_TOUCHES;

  const subject = final
    ? "One last note — Driving Instructors Plymouth"
    : "Following up — Driving Instructors Plymouth";

  const body = final
    ? `Hi there,

Last one from me, promise. If a booking & admin app built for instructors ${place} sounds useful, reply and I'll send a demo link. If not, I'll leave you be.

Best,
Gabe
Driving Instructors Plymouth
www.drivinginstructorsplymouth.com`
    : `Hi there,

Just nudging my note from last week — the booking & admin app for instructors ${place}. Free until January 2027 and the £9.99/month founder rate are still open (first 20).

Quick call or a demo link, whichever suits. If not, no problem at all.

Best,
Gabe
Driving Instructors Plymouth
www.drivinginstructorsplymouth.com`;

  return { subject, body };
}

// Appended automatically at send time - always present, can't be edited away.
export function withUnsubscribeFooter(body: string, unsubscribeUrl: string): string {
  return `${body}

--
Sent by Driving Instructors Plymouth. If you'd rather not hear from me again, opt out here: ${unsubscribeUrl}`;
}
