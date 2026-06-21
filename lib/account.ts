import { randomBytes } from "crypto";
import { del } from "@vercel/blob";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { refundUnusedCredit } from "@/lib/credit-refund";

/**
 * Permanently removes a user and everything that cascades from them (profiles,
 * bookings, messages, push subscriptions — see onDelete rules in the schema).
 * Cleans up blob storage and cancels any Stripe subscription first, since
 * neither lives in our database.
 *
 * This is a true erasure and DESTROYS financial records, so it is no longer the
 * default deletion path — closing an account goes through anonymizeUser, which
 * retains those records. Keep this only for genuine right-to-erasure requests on
 * accounts with no retention obligation.
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

/**
 * Closes an account by scrubbing personal data while RETAINING financial
 * records (bookings, payments, credit ledger, Stripe references) for the
 * accounting-retention period. This is what runs when a 30-day deletion grace
 * period elapses, now that real payments exist — a full cascade-delete would
 * destroy records HMRC requires us to keep.
 *
 * The account can never be logged into or restored afterwards: the email is
 * replaced, the password scrambled, 2FA cleared, and anonymizedAt is stamped.
 */
export async function anonymizeUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      learnerProfile: { select: { id: true } },
      instructorProfile: {
        select: {
          id: true,
          photoUrl: true,
          adiBadgeUrl: true,
          stripeSubscriptionId: true,
        },
      },
    },
  });
  if (!user || user.anonymizedAt) return;

  const learner = user.learnerProfile;
  const instructor = user.instructorProfile;

  // Return any unused prepaid hours before closing, so money isn't stranded.
  // Best-effort: the credit ledger is retained, so anything that fails here can
  // still be reconciled from the records afterwards.
  try {
    if (instructor) {
      const groups = await prisma.creditEntry.groupBy({
        by: ["learnerId"],
        where: { instructorId: instructor.id },
        _sum: { deltaMinutes: true },
      });
      for (const g of groups as {
        learnerId: string;
        _sum: { deltaMinutes: number | null };
      }[]) {
        if ((g._sum.deltaMinutes ?? 0) > 0) {
          await refundUnusedCredit(instructor.id, g.learnerId).catch(() => {});
        }
      }
    }
    if (learner) {
      const groups = await prisma.creditEntry.groupBy({
        by: ["instructorId"],
        where: { learnerId: learner.id },
        _sum: { deltaMinutes: true },
      });
      for (const g of groups as {
        instructorId: string;
        _sum: { deltaMinutes: number | null };
      }[]) {
        if ((g._sum.deltaMinutes ?? 0) > 0) {
          await refundUnusedCredit(g.instructorId, learner.id).catch(() => {});
        }
      }
    }
  } catch {
    // Never block closure on refunds.
  }

  // Remove uploaded files (best-effort).
  for (const url of [instructor?.photoUrl, instructor?.adiBadgeUrl]) {
    if (url) await del(url).catch(() => {});
  }

  // Stop billing for good.
  if (stripeConfigured && instructor?.stripeSubscriptionId) {
    await stripe.subscriptions
      .cancel(instructor.stripeSubscriptionId)
      .catch(() => {});
  }

  // Device push tokens are personal — drop them.
  await prisma.pushSubscription
    .deleteMany({ where: { userId } })
    .catch(() => {});

  // Free any students still rostered to a closing instructor.
  if (instructor) {
    await prisma.learnerProfile.updateMany({
      where: { activeInstructorId: instructor.id },
      data: { activeInstructorId: null },
    });
  }

  const scrambled = randomBytes(48).toString("hex");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@deleted.invalid`,
        name: "Deleted user",
        passwordHash: scrambled,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorBackupCodes: [],
        deletionScheduledFor: null,
        anonymizedAt: new Date(),
      },
    });

    if (learner) {
      await tx.learnerProfile.update({
        where: { id: learner.id },
        data: { postcode: "", goal: null, activeInstructorId: null },
      });
    }

    if (instructor) {
      await tx.instructorProfile.update({
        where: { id: instructor.id },
        data: {
          businessName: null,
          bio: null,
          carDetails: null,
          photoUrl: null,
          adiBadgeUrl: null,
          slug: null,
          inviteCode: null,
          acceptingStudents: false,
          postcodes: "",
          adiNumber: "REMOVED",
        },
      });
    }
  });
}
