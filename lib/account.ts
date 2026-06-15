import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";

/**
 * Permanently removes a user and everything that cascades from them (profiles,
 * bookings, messages, push subscriptions — see onDelete rules in the schema).
 * Cleans up blob storage and cancels any Stripe subscription first, since
 * neither lives in our database.
 *
 * NOTE: when real payments land, transaction records will need to be retained
 * (and anonymised) rather than cascade-deleted, to meet HMRC/accounting rules.
 * At that point this should scrub personal data instead of a full wipe.
 */
export async function hardDeleteUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      instructorProfile: {
        select: { photoUrl: true, adiBadgeUrl: true, stripeSubscriptionId: true },
      },
    },
  });
  if (!user) return;

  const instructor = user.instructorProfile;

  // Remove uploaded files (best-effort — never block the delete on these).
  for (const url of [instructor?.photoUrl, instructor?.adiBadgeUrl]) {
    if (url) await del(url).catch(() => {});
  }

  // Stop billing for good.
  if (stripeConfigured && instructor?.stripeSubscriptionId) {
    await stripe.subscriptions
      .cancel(instructor.stripeSubscriptionId)
      .catch(() => {});
  }

  // Cascades handle profiles, bookings, messages, push subscriptions, etc.
  await prisma.user.delete({ where: { id: userId } });
}
