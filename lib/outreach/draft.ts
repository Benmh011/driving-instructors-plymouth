// Templated first-contact draft. The agent generates one of these per prospect;
// you edit and approve before anything sends. Kept personal and low-key on
// purpose — reads like a real person, not a campaign.

export function buildDraft(prospect: { name: string; area: string | null }): {
  subject: string;
  body: string;
} {
  const where = prospect.area ? ` in ${prospect.area}` : "";
  const subject = "A booking & admin tool built for local driving instructors";
  const body = `Hi ${prospect.name},

I'm a local driving instructor and I've built Driving Instructors Plymouth — a booking and admin platform made for instructors around Plymouth and the South Hams${where}. It handles your diary, student management, online payments and theory-test practice for your pupils, from £9.99/month on the founder rate.

Thought it might save you some admin time. If you'd like, I can send over a quick demo link to take a look.

If it's not for you, no worries at all — just reply and let me know.

Best,
[your name]
Driving Instructors Plymouth`;

  return { subject, body };
}

// Appended automatically at send time — always present, can't be edited away.
export function withUnsubscribeFooter(body: string, unsubscribeUrl: string): string {
  return `${body}

—
Sent by Driving Instructors Plymouth. If you'd rather not hear from me again, opt out here: ${unsubscribeUrl}`;
}
