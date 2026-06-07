"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// A learner asks to join an instructor from the marketplace (cold request).
export async function createJoinRequest(instructorId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true },
  });
  if (!user) redirect("/login");
  if (user.role !== "LEARNER" || !user.learnerProfile) return;
  if (!user.onboardingComplete) redirect("/onboarding");

  // Only unattached learners can request via the marketplace.
  if (user.learnerProfile.activeInstructorId) return;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { id: instructorId },
  });
  if (!instructor) return;

  const message = (formData.get("message") as string | null)?.slice(0, 300) || null;

  // One request row per learner/instructor pair — re-requesting resets it.
  await prisma.joinRequest.upsert({
    where: {
      instructorId_learnerId: {
        instructorId,
        learnerId: user.learnerProfile.id,
      },
    },
    create: {
      instructorId,
      learnerId: user.learnerProfile.id,
      message,
      status: "PENDING",
    },
    update: { status: "PENDING", message },
  });

  revalidatePath(`/instructors/${instructorId}`);
}

// Learner withdraws a pending request.
export async function withdrawJoinRequest(instructorId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true },
  });
  if (!user?.learnerProfile) return;

  await prisma.joinRequest.deleteMany({
    where: {
      instructorId,
      learnerId: user.learnerProfile.id,
      status: "PENDING",
    },
  });

  revalidatePath(`/instructors/${instructorId}`);
}
