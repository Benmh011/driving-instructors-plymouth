"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = { error?: string } | undefined;

const lessonSchema = z.object({
  learnerId: z.string().min(1, "Choose a student."),
  start: z.string().min(1, "Pick a date and time."),
  durationMins: z.coerce.number().int().min(30).max(240),
  notes: z.string().max(500).optional(),
});

const editSchema = z.object({
  start: z.string().min(1, "Pick a date and time."),
  durationMins: z.coerce.number().int().min(30).max(240),
  notes: z.string().max(500).optional(),
});

// Instructor books a lesson for one of their roster learners.
export async function createLesson(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/dashboard");

  const parsed = lessonSchema.safeParse({
    learnerId: formData.get("learnerId"),
    start: formData.get("start"),
    durationMins: formData.get("durationMins"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the lesson details." };
  }

  const { learnerId, start, durationMins, notes } = parsed.data;

  const learner = await prisma.learnerProfile.findUnique({ where: { id: learnerId } });
  if (!learner || learner.activeInstructorId !== instructor.id) {
    return { error: "That learner isn't on your list." };
  }

  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) {
    return { error: "That date and time didn't look right." };
  }

  const pricePence = Math.round(instructor.hourlyRate * 100 * (durationMins / 60));

  await prisma.booking.create({
    data: {
      instructorId: instructor.id,
      learnerId,
      start: startDate,
      durationMins,
      pricePence,
      notes: notes ?? null,
    },
  });

  redirect("/diary");
}

// Instructor edits a lesson — reschedule and/or notes (before or after the lesson).
export async function updateLesson(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/dashboard");

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking || booking.instructorId !== instructor.id) redirect("/diary");
  if (booking.status === "CANCELLED") redirect("/diary");

  const parsed = editSchema.safeParse({
    start: formData.get("start"),
    durationMins: formData.get("durationMins"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the details." };
  }

  const startDate = new Date(parsed.data.start);
  if (Number.isNaN(startDate.getTime())) {
    return { error: "That date and time didn't look right." };
  }

  await prisma.booking.update({
    where: { id },
    data: {
      start: startDate,
      durationMins: parsed.data.durationMins,
      notes: parsed.data.notes ?? null,
    },
  });

  redirect("/diary");
}

// Either party on a lesson can cancel it.
export async function cancelLesson(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true, instructorProfile: true },
  });
  if (!user) return;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.status !== "BOOKED") return;

  const ownsAsInstructor =
    !!user.instructorProfile && booking.instructorId === user.instructorProfile.id;
  const ownsAsLearner =
    !!user.learnerProfile && booking.learnerId === user.learnerProfile.id;
  if (!ownsAsInstructor && !ownsAsLearner) return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/diary");
}
