import { prisma } from "@/lib/prisma";
import { FOUNDER_SEATS } from "@/lib/constants";
import { isFounderEligible } from "@/lib/subscription";
import { adminEmails } from "@/lib/admin";

// Founder seats taken by real instructors. Admin/test accounts (yours) don't
// occupy a seat — all 20 go to actual instructors.
async function seatsTaken(): Promise<number> {
  return prisma.instructorProfile.count({
    where: {
      isFounder: true,
      user: { email: { notIn: adminEmails() } },
    },
  });
}

// Is the founder offer still open? True only while we're inside the launch
// window AND fewer than FOUNDER_SEATS instructors hold founder status. The
// seat cap makes "first 20 instructors" a real, enforced limit — not just
// marketing copy.
export async function founderOfferOpen(): Promise<boolean> {
  if (!isFounderEligible()) return false;
  return (await seatsTaken()) < FOUNDER_SEATS;
}

export async function founderSeatsLeft(): Promise<number> {
  return Math.max(0, FOUNDER_SEATS - (await seatsTaken()));
}
