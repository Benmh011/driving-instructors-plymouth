import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { accessState, hasFullAccess } from "@/lib/subscription";

export type TheoryGate =
  | { ok: true }
  | { ok: false; reason: "login" | "no-instructor" | "instructor-inactive" | "subscribe" };

// Theory practice is unlocked for a learner while their active instructor is
// subscribed, and for an instructor (to preview) while they're subscribed.
export async function theoryAccess(): Promise<TheoryGate> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, reason: "login" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      instructorProfile: true,
      learnerProfile: { include: { activeInstructor: true } },
    },
  });
  if (!user) return { ok: false, reason: "login" };

  if (user.role === "INSTRUCTOR") {
    // Instructors can always preview what their students get, even if their own
    // subscription has lapsed — previewing is harmless and nothing is recorded.
    return { ok: true };
  }

  const active = user.learnerProfile?.activeInstructor;
  if (!active) return { ok: false, reason: "no-instructor" };
  return hasFullAccess(accessState(active))
    ? { ok: true }
    : { ok: false, reason: "instructor-inactive" };
}
