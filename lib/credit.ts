import { prisma } from "@/lib/prisma";

// Prepaid-hours credit ledger. The balance is always derived from the sum of
// entries, never stored, so it can't drift out of sync with its history.

// Balance, in minutes, of a learner's prepaid credit with one instructor.
export async function creditBalanceMinutes(
  instructorId: string,
  learnerId: string,
): Promise<number> {
  const agg = await prisma.creditEntry.aggregate({
    where: { instructorId, learnerId },
    _sum: { deltaMinutes: true },
  });
  return agg._sum.deltaMinutes ?? 0;
}

// Display helper: 90 -> "1.5 hours", 60 -> "1 hour", 30 -> "30 mins".
export function formatHours(minutes: number): string {
  if (minutes <= 0) return "0 hours";
  if (minutes < 60) return `${minutes} mins`;
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  return `${(minutes / 60).toFixed(1)} hours`;
}

// If a lesson was covered by prepaid credit, return the still-outstanding hours
// to the learner's balance. Idempotent: once the lesson's entries net to zero,
// repeat calls do nothing, and it's a no-op for lessons never paid by credit.
export async function refundLessonCredit(bookingId: string): Promise<void> {
  const entries: { deltaMinutes: number; instructorId: string; learnerId: string }[] =
    await prisma.creditEntry.findMany({
      where: { bookingId, reason: { in: ["LESSON", "REFUND"] } },
      select: { deltaMinutes: true, instructorId: true, learnerId: true },
    });
  if (entries.length === 0) return;
  const net = entries.reduce((sum, e) => sum + e.deltaMinutes, 0);
  if (net >= 0) return; // nothing still drawn down
  await prisma.creditEntry.create({
    data: {
      instructorId: entries[0].instructorId,
      learnerId: entries[0].learnerId,
      deltaMinutes: -net,
      reason: "REFUND",
      bookingId,
    },
  });
}
