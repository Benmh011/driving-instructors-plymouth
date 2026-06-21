"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blockBookingsEnabled } from "@/lib/flags";
import { refundUnusedCredit } from "@/lib/credit-refund";
import { formatHours } from "@/lib/credit";
import { sendPushToUser } from "@/lib/push";

async function currentInstructorId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const inst = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  return inst?.id ?? null;
}

async function notifyLearner(learnerId: string, refundedMinutes: number) {
  if (refundedMinutes <= 0) return;
  const learner = await prisma.learnerProfile.findUnique({
    where: { id: learnerId },
    select: { userId: true },
  });
  if (!learner) return;
  await sendPushToUser(learner.userId, {
    title: "Unused hours refunded",
    body: `${formatHours(refundedMinutes)} of unused credit has been refunded to your card.`,
    url: "/credit",
    tag: `credit-refund-${learnerId}`,
  });
}

// Refund one learner's unused prepaid hours.
export async function refundStudentCredit(
  learnerId: string,
): Promise<{ error?: string; refundedPence?: number }> {
  if (!blockBookingsEnabled()) return { error: "Block bookings are turned off." };
  const instructorId = await currentInstructorId();
  if (!instructorId) return { error: "Only instructors can do this." };

  const res = await refundUnusedCredit(instructorId, learnerId);
  await notifyLearner(learnerId, res.refundedMinutes);

  revalidatePath("/dashboard/credit");
  if (res.error) return { error: res.error };
  return { refundedPence: res.refundedPence };
}

// Refund every learner who still holds prepaid hours — the "I'm closing my
// account / stopping lessons" case.
export async function refundAllCredit(): Promise<{
  error?: string;
  students?: number;
  refundedPence?: number;
}> {
  if (!blockBookingsEnabled()) return { error: "Block bookings are turned off." };
  const instructorId = await currentInstructorId();
  if (!instructorId) return { error: "Only instructors can do this." };

  const grouped: { learnerId: string; _sum: { deltaMinutes: number | null } }[] =
    await prisma.creditEntry.groupBy({
      by: ["learnerId"],
      where: { instructorId },
      _sum: { deltaMinutes: true },
    });
  const owed = grouped.filter((g) => (g._sum.deltaMinutes ?? 0) > 0);

  let students = 0;
  let refundedPence = 0;
  let failures = 0;
  for (const g of owed) {
    const res = await refundUnusedCredit(instructorId, g.learnerId);
    if (res.refundedMinutes > 0) {
      students += 1;
      refundedPence += res.refundedPence;
      await notifyLearner(g.learnerId, res.refundedMinutes);
    }
    failures += res.failures;
  }

  revalidatePath("/dashboard/credit");
  if (failures > 0) {
    return {
      error: `Refunded ${students} student${students === 1 ? "" : "s"}, but some charges didn't go through — please try again.`,
      students,
      refundedPence,
    };
  }
  return { students, refundedPence };
}
