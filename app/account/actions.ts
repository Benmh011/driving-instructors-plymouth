"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";

const GRACE_DAYS = 30;

export type DeleteState = { error?: string } | undefined;

export async function requestAccountDeletion(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
      deletionScheduledFor: true,
      instructorProfile: { select: { id: true, stripeSubscriptionId: true } },
      learnerProfile: { select: { id: true } },
    },
  });
  if (!user) redirect("/login");

  // Re-authenticate for a destructive action.
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "That password isn't right." };

  if (user.deletionScheduledFor) redirect("/account/closing");

  // Guard: don't let someone disappear with live commitments on either side.
  const now = new Date();
  const orFilters: { instructorId?: string; learnerId?: string }[] = [];
  if (user.instructorProfile) orFilters.push({ instructorId: user.instructorProfile.id });
  if (user.learnerProfile) orFilters.push({ learnerId: user.learnerProfile.id });
  const upcoming = orFilters.length
    ? await prisma.booking.count({
        where: { status: "BOOKED", start: { gt: now }, OR: orFilters },
      })
    : 0;
  if (upcoming > 0) {
    return {
      error: `You have ${upcoming} upcoming lesson${upcoming === 1 ? "" : "s"} booked. Please cancel or complete ${upcoming === 1 ? "it" : "them"} before closing your account.`,
    };
  }

  const scheduledFor = new Date(now.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: userId },
    data: { deletionScheduledFor: scheduledFor },
  });

  // Stop the next charge but keep the current paid period (reversible on restore
  // while the period is still running).
  if (stripeConfigured && user.instructorProfile?.stripeSubscriptionId) {
    await stripe.subscriptions
      .update(user.instructorProfile.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
      .catch(() => {});
  }

  redirect("/account/closing");
}

export async function restoreAccount(): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { instructorProfile: { select: { stripeSubscriptionId: true } } },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { deletionScheduledFor: null },
  });

  // Undo the pending cancellation if the subscription is still around.
  if (stripeConfigured && user?.instructorProfile?.stripeSubscriptionId) {
    await stripe.subscriptions
      .update(user.instructorProfile.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })
      .catch(() => {});
  }

  redirect("/dashboard");
}
