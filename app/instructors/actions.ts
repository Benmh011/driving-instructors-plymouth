"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { accessState, hasFullAccess } from "@/lib/subscription";

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
  // Can't request to join an instructor who isn't on an active subscription.
  if (!hasFullAccess(accessState(instructor))) return;

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

export type ActionState = { error?: string } | undefined;

// A learner posts or updates a review for an instructor they've booked with.
export async function submitReview(
  instructorId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please log in to leave a review." };

  const learner = await prisma.learnerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!learner) return { error: "Only learner accounts can leave reviews." };

  // Must have a real relationship — a booking with this instructor.
  const booking = await prisma.booking.findFirst({
    where: { instructorId, learnerId: learner.id },
    select: { id: true },
  });
  if (!booking) {
    return { error: "You can review an instructor once you've booked a lesson with them." };
  }

  const rating = Number.parseInt(String(formData.get("rating") ?? ""), 10);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Please pick a rating from 1 to 5 stars." };
  }
  const raw = String(formData.get("body") ?? "").trim();
  const body = raw.length > 0 ? raw.slice(0, 1000) : null;

  await prisma.review.upsert({
    where: { instructorId_learnerId: { instructorId, learnerId: learner.id } },
    create: { instructorId, learnerId: learner.id, rating, body },
    update: { rating, body },
  });

  revalidatePath("/instructors/[id]", "page");
  return undefined;
}
