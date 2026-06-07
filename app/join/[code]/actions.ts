"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MAX_ROSTER } from "@/lib/constants";

// Invite-code joins are instant — the instructor shared the link, so no approval.
export async function joinInstructor(code: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true },
  });
  if (!user || user.role !== "LEARNER" || !user.learnerProfile) {
    redirect("/dashboard");
  }

  const instructor = await prisma.instructorProfile.findUnique({
    where: { inviteCode: code },
  });
  if (!instructor) redirect("/dashboard");

  // Already on this instructor's list — nothing to do.
  if (user.learnerProfile.activeInstructorId === instructor.id) {
    redirect("/dashboard");
  }

  // Respect the hard roster ceiling.
  const rosterCount = await prisma.learnerProfile.count({
    where: { activeInstructorId: instructor.id },
  });
  if (rosterCount >= MAX_ROSTER) {
    redirect(`/join/${code}?full=1`);
  }

  // Switching or joining: point the learner at this instructor.
  // (Lesson-cancellation handling on a switch lands with the booking diary.)
  await prisma.learnerProfile.update({
    where: { id: user.learnerProfile.id },
    data: { activeInstructorId: instructor.id },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard?joined=1");
}
