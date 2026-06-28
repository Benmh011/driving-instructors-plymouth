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
    ? `I came across ${name} while putting together a list of instructors ${place}, and thought this might be useful to you.`
    : `I work with instructors ${place} and thought this might be useful to you.`;

  const body = `Hi there,

${opener}

I'm local and I run Driving Instructors Plymouth, a booking and admin platform I've built for instructors ${place}. It gives you your own diary (lessons, income and expenses), student management, optional online payments, and theory-test practice for your pupils.

There's a one-month free trial to get started. After that it's £9.99/month on the founder rate, and if you sign up now that price is locked in for good.

If you'd like, I can send over a quick demo link to take a look. And if it's not for you, no worries at all — just reply and let me know.

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
