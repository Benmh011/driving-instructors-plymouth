// Templated first-contact draft. The agent generates one of these per prospect;
// you edit and approve before anything sends. Honest and low-key on purpose -
// reads like a real person, not a campaign. (You built the tool; you're not
// claiming to be an instructor.)

export function buildDraft(_prospect: { name: string; area: string | null }): {
  subject: string;
  body: string;
} {
  const subject = "A booking tool for Plymouth driving instructors";
  const body = `Hi there,

I'm local and I run Driving Instructors Plymouth, a booking and admin platform I've built for instructors around Plymouth and the South Hams. It gives you your own diary (lessons, income and expenses), student management, optional online payments, and theory-test practice for your pupils, from £9.99/month on the founder rate. There's a one-month free trial to get started.

Thought it might save you some admin time, as well as give your students somewhere to practise their theory. If you'd like, I can send over a quick demo link to take a look.

If it's not for you, no worries at all, just reply and let me know.

Best,
Gabe
Driving Instructors Plymouth`;

  return { subject, body };
}

// Appended automatically at send time - always present, can't be edited away.
export function withUnsubscribeFooter(body: string, unsubscribeUrl: string): string {
  return `${body}

--
Sent by Driving Instructors Plymouth. If you'd rather not hear from me again, opt out here: ${unsubscribeUrl}`;
}
