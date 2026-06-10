"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MAX_ROSTER } from "@/lib/constants";
import { accessState, hasFullAccess } from "@/lib/subscription";

// Flip the instructor's "taking new students" availability.
export async function toggleAccepting() {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;
  if (!hasFullAccess(accessState(profile))) return;

  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: { acceptingStudents: !profile.acceptingStudents },
  });

  revalidatePath("/students");
}

// Instructor accepts a marketplace join request — attaches the learner to their roster.
export async function acceptJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { _count: { select: { roster: true } } },
  });
  if (!profile) return;

  const request = await prisma.joinRequest.findUnique({ where: { id: requestId } });
  if (!request || request.instructorId !== profile.id || request.status !== "PENDING") return;

  // Respect the hard roster cap.
  if (profile._count.roster >= MAX_ROSTER) return;

  // Locked instructors can't take on new students.
  if (!hasFullAccess(accessState(profile))) return;

  await prisma.$transaction([
    prisma.learnerProfile.update({
      where: { id: request.learnerId },
      data: { activeInstructorId: profile.id },
    }),
    prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    }),
  ]);

  revalidatePath("/students");
}

// Instructor declines a marketplace join request.
export async function declineJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;

  const request = await prisma.joinRequest.findUnique({ where: { id: requestId } });
  if (!request || request.instructorId !== profile.id || request.status !== "PENDING") return;

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED" },
  });

  revalidatePath("/students");
}
