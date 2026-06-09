import { prisma } from "@/lib/prisma";

export type ConversationParty = {
  meId: string;
  role: "INSTRUCTOR" | "LEARNER";
  instructorUserId: string;
  learnerUserId: string;
  instructorName: string;
  learnerName: string;
};

// Verifies the signed-in user is a party to the (instructorId, learnerId)
// conversation AND that the learner is currently on that instructor's roster.
// This is the core gate: only connected pairs can message each other.
export async function authorizeConversation(
  userId: string,
  instructorId: string,
  learnerId: string,
): Promise<ConversationParty | null> {
  if (!instructorId || !learnerId) return null;

  const learner = await prisma.learnerProfile.findUnique({
    where: { id: learnerId },
    include: { user: true, activeInstructor: { include: { user: true } } },
  });
  if (!learner || learner.activeInstructorId !== instructorId) return null;

  const instructor = learner.activeInstructor;
  if (!instructor) return null;

  let role: "INSTRUCTOR" | "LEARNER";
  if (userId === instructor.userId) role = "INSTRUCTOR";
  else if (userId === learner.userId) role = "LEARNER";
  else return null;

  return {
    meId: userId,
    role,
    instructorUserId: instructor.userId,
    learnerUserId: learner.userId,
    instructorName: instructor.businessName || instructor.user.name,
    learnerName: learner.user.name,
  };
}
