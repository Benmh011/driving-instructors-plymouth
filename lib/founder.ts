import { prisma } from "@/lib/prisma";
import { FOUNDER_SEATS } from "@/lib/constants";
import { isFounderEligible } from "@/lib/subscription";

// Is the founder offer still open? True only while we're inside the launch
// window AND fewer than FOUNDER_SEATS instructors hold founder status. The
// seat cap makes "first 20 instructors" a real, enforced limit — not just
// marketing copy.
export async function founderOfferOpen(): Promise<boolean> {
  if (!isFounderEligible()) return false;
  const taken = await prisma.instructorProfile.count({
    where: { isFounder: true },
  });
  return taken < FOUNDER_SEATS;
}

export async function founderSeatsLeft(): Promise<number> {
  const taken = await prisma.instructorProfile.count({
    where: { isFounder: true },
  });
  return Math.max(0, FOUNDER_SEATS - taken);
}
