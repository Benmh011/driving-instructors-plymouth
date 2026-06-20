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
