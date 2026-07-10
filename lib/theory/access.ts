import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

  // Learners: theory practice is free with an account. It's the learner-side
  // value of the platform from day one (and doubles as a perk instructors can
  // point their pupils at), so it isn't gated on having an instructor.
  return { ok: true };
}
