"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser, formatLessonWhen } from "@/lib/push";

export type ActionState = { error?: string } | undefined;

const lessonSchema = z.object({
  learnerId: z.string().min(1, "Choose a student."),
  start: z.string().min(1, "Pick a date and time."),
  durationMins: z.coerce.number().int().min(30).max(240),
  price: z.coerce.number().min(0).max(10000).optional(),
  notes: z.string().max(500).optional(),
});

const editSchema = z.object({
  start: z.string().min(1, "Pick a date and time."),
  durationMins: z.coerce.number().int().min(30).max(240),
  price: z.coerce.number().min(0, "Enter a price (0 or more).").max(10000),
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
    include: { user: true },
  });
  if (!instructor) redirect("/dashboard");

  const parsed = lessonSchema.safeParse({
    learnerId: formData.get("learnerId"),
    start: formData.get("start"),
    durationMins: formData.get("durationMins"),
    price: formData.get("price") || undefined,
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

  const pricePence =
    parsed.data.price != null
      ? Math.round(parsed.data.price * 100)
      : Math.round(instructor.hourlyRate * 100 * (durationMins / 60));

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

  // Let the student know a lesson was booked for them.
  const instructorName = instructor.businessName || instructor.user.name;
  await sendPushToUser(learner.userId, {
    title: "Lesson booked",
    body: `${instructorName} booked you a lesson — ${formatLessonWhen(startDate)}.`,
    url: "/diary",
    tag: `booked-${learnerId}`,
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
    price: formData.get("price"),
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
      pricePence: Math.round(parsed.data.price * 100),
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

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      learner: { include: { user: true } },
      instructor: { include: { user: true } },
    },
  });
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

  // Notify whoever didn't cancel.
  const when = formatLessonWhen(booking.start);
  if (ownsAsLearner) {
    await sendPushToUser(booking.instructor.userId, {
      title: "Lesson cancelled",
      body: `${booking.learner.user.name} cancelled their lesson — ${when}.`,
      url: "/diary",
      tag: `cancel-${bookingId}`,
    });
  } else {
    const instructorName =
      booking.instructor.businessName || booking.instructor.user.name;
    await sendPushToUser(booking.learner.userId, {
      title: "Lesson cancelled",
      body: `${instructorName} cancelled your lesson — ${when}.`,
      url: "/diary",
      tag: `cancel-${bookingId}`,
    });
  }

  revalidatePath("/diary");
}

// Instructor toggles whether a lesson has been paid for (drives the earnings tracker).
export async function setLessonPaid(bookingId: string, paid: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) return;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.instructorId !== instructor.id) return;
  if (booking.status === "CANCELLED") return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { paid },
  });

  revalidatePath("/diary");
  revalidatePath("/dashboard/tax");
}

// Instructor marks a lesson as completed (this is what counts it as income in the tax tracker).
export async function markLessonComplete(bookingId: string) {
  await setLessonCompletion(bookingId, true);
}

// Undo: put a completed lesson back to booked.
export async function reopenLesson(bookingId: string) {
  await setLessonCompletion(bookingId, false);
}

async function setLessonCompletion(bookingId: string, complete: boolean) {
  const session = await auth();
  if (!session?.user?.id) return;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) return;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.instructorId !== instructor.id) return;

  // Only move between BOOKED and COMPLETED — never touch a cancelled lesson.
  if (complete && booking.status !== "BOOKED") return;
  if (!complete && booking.status !== "COMPLETED") return;

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: complete ? "COMPLETED" : "BOOKED" },
  });

  revalidatePath("/diary");
  revalidatePath("/dashboard/tax");
}
