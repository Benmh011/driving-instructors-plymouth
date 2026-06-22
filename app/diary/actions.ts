"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendPushToUser, formatLessonWhen } from "@/lib/push";
import { accessState, hasFullAccess, LOCKED_MESSAGE } from "@/lib/subscription";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { canAcceptPayments } from "@/lib/connect";
import { markBookingPaidFromSession } from "@/lib/lesson-pay";
import { blockBookingsEnabled } from "@/lib/flags";
import { creditBalanceMinutes, refundLessonCredit } from "@/lib/credit";
import { SITE_URL } from "@/lib/constants";

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

// Open (unclaimed) lesson slot — same as a booking minus the learner.
const openLessonSchema = z.object({
  start: z.string().min(1, "Pick a date and time."),
  durationMins: z.coerce.number().int().min(30).max(240),
  price: z.coerce.number().min(0).max(10000).optional(),
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
  if (!hasFullAccess(accessState(instructor))) return { error: LOCKED_MESSAGE };

  // "Leave open" — post an unclaimed slot any of the instructor's students can
  // pick up, rather than booking it for a specific learner.
  const leaveOpen = formData.get("leaveOpen") === "on";
  if (leaveOpen) {
    const parsedOpen = openLessonSchema.safeParse({
      start: formData.get("start"),
      durationMins: formData.get("durationMins"),
      price: formData.get("price") || undefined,
      notes: formData.get("notes") || undefined,
    });
    if (!parsedOpen.success) {
      return {
        error: parsedOpen.error.issues[0]?.message ?? "Please check the lesson details.",
      };
    }
    const startDate = new Date(parsedOpen.data.start);
    if (Number.isNaN(startDate.getTime())) {
      return { error: "That date and time didn't look right." };
    }
    const pricePence =
      parsedOpen.data.price != null
        ? Math.round(parsedOpen.data.price * 100)
        : Math.round(
            instructor.hourlyRate * 100 * (parsedOpen.data.durationMins / 60),
          );
    await prisma.openLesson.create({
      data: {
        instructorId: instructor.id,
        start: startDate,
        durationMins: parsedOpen.data.durationMins,
        pricePence,
        notes: parsedOpen.data.notes ?? null,
      },
    });
    revalidatePath("/diary");
    redirect("/diary");
  }

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

  revalidatePath("/diary");
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
  if (!hasFullAccess(accessState(instructor))) return { error: LOCKED_MESSAGE };

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

  revalidatePath("/diary");
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

  // A locked instructor can't cancel — but the learner always can, so nobody is
  // trapped in a lesson they can't get out of.
  if (
    ownsAsInstructor &&
    user.instructorProfile &&
    !hasFullAccess(accessState(user.instructorProfile))
  ) {
    return;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      // A paid lesson now needs a refund decision from the instructor.
      ...(booking.paid ? { refundStatus: "PENDING" } : {}),
    },
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

  // Paid lessons leave a pending refund for the instructor to approve or
  // decline (see approveRefund / declineRefund) — nothing is returned here.

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
  if (!hasFullAccess(accessState(instructor))) return;

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
  if (!hasFullAccess(accessState(instructor))) return;

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

// ── Learner pays for a single lesson by card ──────────────────────────────
// Direct charge on the instructor's connected account: the learner pays the
// instructor, the platform never holds the funds. Money lands with the
// instructor; we take no cut (Option A). Payment is confirmed two ways — the
// success-return verification (immediate) and the webhook (backup) — so it
// never depends on webhook timing, and a lesson can't be paid for twice.
export async function payForLesson(
  bookingId: string,
): Promise<{ url?: string; error?: string; paid?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in to pay." };
  if (!stripeConfigured) return { error: "Card payments aren't available right now." };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      paid: true,
      status: true,
      pricePence: true,
      stripeCheckoutSessionId: true,
      learner: { select: { userId: true } },
      instructor: {
        select: {
          stripeConnectAccountId: true,
          connectChargesEnabled: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
          businessName: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!booking) return { error: "Lesson not found." };
  if (booking.learner.userId !== session.user.id) {
    return { error: "That isn't your lesson." };
  }
  if (booking.paid) return { error: "This lesson is already paid.", paid: true };
  if (booking.status === "CANCELLED") return { error: "This lesson was cancelled." };
  if (booking.pricePence == null || booking.pricePence < 30) {
    return { error: "No price has been set for this lesson yet — ask your instructor." };
  }

  const inst = booking.instructor;
  const acct = inst.stripeConnectAccountId;
  if (
    !acct ||
    !canAcceptPayments({
      connectChargesEnabled: inst.connectChargesEnabled,
      subscriptionStatus: inst.subscriptionStatus,
      trialEndsAt: inst.trialEndsAt,
      currentPeriodEnd: inst.currentPeriodEnd,
    })
  ) {
    return { error: "Your instructor isn't set up to take card payments yet." };
  }

  // Anti-double-pay: if a checkout is already in flight for this lesson, reuse
  // it rather than spin up a second one — or reconcile if it was already paid.
  if (booking.stripeCheckoutSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(
        booking.stripeCheckoutSessionId,
        undefined,
        { stripeAccount: acct },
      );
      if (existing.payment_status === "paid") {
        await markBookingPaidFromSession(booking.id, existing);
        return { error: "This lesson is already paid.", paid: true };
      }
      if (existing.status === "open" && existing.url) {
        return { url: existing.url };
      }
      // expired / unusable → fall through and create a fresh session
    } catch {
      // couldn't fetch it → fall through and create a fresh session
    }
  }

  const instructorName = inst.businessName || inst.user.name || "your instructor";

  try {
    const checkout = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: booking.pricePence,
              product_data: { name: `Driving lesson with ${instructorName}` },
            },
          },
        ],
        success_url: `${SITE_URL}/diary?paid={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/diary?pay=cancelled`,
        metadata: { bookingId: booking.id },
        payment_intent_data: { metadata: { bookingId: booking.id } },
      },
      // The {stripeAccount} request option makes this a DIRECT charge created
      // on the instructor's connected account.
      { stripeAccount: acct },
    );

    if (!checkout.url) return { error: "Couldn't start checkout. Please try again." };

    // Remember the session so we can verify it on return and block double-pay.
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeCheckoutSessionId: checkout.id },
    });

    return { url: checkout.url };
  } catch {
    return { error: "Couldn't start checkout. Please try again." };
  }
}

// ── Open lessons ──────────────────────────────────────────────────────────

// A learner claims one of their instructor's open slots. Atomic: we delete the
// open slot and create the booking together, so a slot can't be claimed twice.
export async function claimOpenLesson(
  openLessonId: string,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true },
  });
  if (!user || user.role !== "LEARNER" || !user.learnerProfile) {
    return { error: "Only students can claim lessons." };
  }
  const learner = user.learnerProfile;

  const open = await prisma.openLesson.findUnique({
    where: { id: openLessonId },
    include: { instructor: { include: { user: true } } },
  });
  if (!open) return { error: "That lesson has already been taken." };
  if (learner.activeInstructorId !== open.instructorId) {
    return { error: "That lesson isn't from your instructor." };
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      const del = await tx.openLesson.deleteMany({ where: { id: openLessonId } });
      if (del.count === 0) throw new Error("ALREADY_CLAIMED");
      await tx.booking.create({
        data: {
          instructorId: open.instructorId,
          learnerId: learner.id,
          start: open.start,
          durationMins: open.durationMins,
          pricePence: open.pricePence,
          notes: open.notes,
        },
      });
    });
  } catch {
    return { error: "That lesson has already been taken." };
  }

  await sendPushToUser(open.instructor.userId, {
    title: "Open lesson claimed",
    body: `${user.name ?? "A student"} claimed your open lesson — ${formatLessonWhen(open.start)}.`,
    url: "/diary",
    tag: `claimed-${openLessonId}`,
  });

  revalidatePath("/diary");
  return {};
}

// Instructor removes one of their own unclaimed open slots.
export async function removeOpenLesson(openLessonId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) return;

  await prisma.openLesson.deleteMany({
    where: { id: openLessonId, instructorId: instructor.id },
  });
  revalidatePath("/diary");
}

// A learner covers one of their unpaid lessons from their prepaid credit. Atomic
// and balance-checked so a lesson can't be double-covered or overdrawn.
export async function coverLessonWithCredit(
  bookingId: string,
): Promise<{ error?: string }> {
  if (!blockBookingsEnabled()) return { error: "Lesson credit isn't available." };

  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { learnerProfile: { select: { id: true } } },
  });
  const learnerId = user?.learnerProfile?.id;
  if (!learnerId) return { error: "Only students can use lesson credit." };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      paid: true,
      status: true,
      durationMins: true,
      learnerId: true,
      instructorId: true,
    },
  });
  if (!booking) return { error: "Lesson not found." };
  if (booking.learnerId !== learnerId) return { error: "That isn't your lesson." };
  if (booking.paid) return { error: "This lesson is already covered." };
  if (booking.status === "CANCELLED") return { error: "This lesson was cancelled." };

  const balance = await creditBalanceMinutes(booking.instructorId, learnerId);
  if (balance < booking.durationMins) {
    return { error: "You don't have enough credit for this lesson." };
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      const flipped = await tx.booking.updateMany({
        where: { id: bookingId, paid: false, status: { not: "CANCELLED" } },
        data: { paid: true, paidAt: new Date() },
      });
      if (flipped.count === 0) throw new Error("ALREADY");
      await tx.creditEntry.create({
        data: {
          instructorId: booking.instructorId,
          learnerId,
          deltaMinutes: -booking.durationMins,
          reason: "LESSON",
          bookingId,
        },
      });
    });
  } catch {
    return { error: "Couldn't use your credit just now — please try again." };
  }

  revalidatePath("/diary");
  return {};
}

// ── Refunds (instructor-approved) ──────────────────────────────────────────

// Instructor approves a pending refund on a cancelled, paid lesson. Card
// payments are refunded via Stripe on the connected account; credit-covered
// lessons return their hours to the learner's balance.
export async function approveRefund(
  bookingId: string,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, stripeConnectAccountId: true, businessName: true },
  });
  if (!instructor) return { error: "Only instructors can do this." };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      instructorId: true,
      start: true,
      durationMins: true,
      pricePence: true,
      refundStatus: true,
      stripePaymentIntentId: true,
      learner: { select: { userId: true } },
    },
  });
  if (!booking) return { error: "Lesson not found." };
  if (booking.instructorId !== instructor.id) {
    return { error: "That isn't your lesson." };
  }
  if (booking.refundStatus !== "PENDING") {
    return { error: "There's no refund waiting on this lesson." };
  }

  const creditEntry = await prisma.creditEntry.findFirst({
    where: { bookingId, reason: "LESSON" },
    select: { id: true },
  });
  const paidByCredit = !!creditEntry;

  // Claim atomically so a refund can't be processed twice.
  const claimed = await prisma.booking.updateMany({
    where: { id: bookingId, refundStatus: "PENDING" },
    data: { refundStatus: "REFUNDED" },
  });
  if (claimed.count === 0) return { error: "That refund was already handled." };

  if (paidByCredit) {
    await refundLessonCredit(bookingId);
  } else if (booking.stripePaymentIntentId && instructor.stripeConnectAccountId) {
    try {
      const refund = await stripe.refunds.create(
        { payment_intent: booking.stripePaymentIntentId },
        { stripeAccount: instructor.stripeConnectAccountId },
      );
      await prisma.booking.update({
        where: { id: bookingId },
        data: { stripeRefundId: refund.id },
      });
    } catch {
      // Roll the claim back so the instructor can retry.
      await prisma.booking.update({
        where: { id: bookingId },
        data: { refundStatus: "PENDING" },
      });
      return { error: "The card refund didn't go through — please try again." };
    }
  }

  await sendPushToUser(booking.learner.userId, {
    title: "Refund approved",
    body: paidByCredit
      ? `Your hours have been returned — ${formatLessonWhen(booking.start)}.`
      : `Your payment has been refunded — ${formatLessonWhen(booking.start)}.`,
    url: "/diary",
    tag: `refund-${bookingId}`,
  });

  revalidatePath("/diary");
  return {};
}

// Instructor declines a pending refund (e.g. a late cancellation inside their
// notice window). The lesson stays paid; nothing is returned.
export async function declineRefund(
  bookingId: string,
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!instructor) return { error: "Only instructors can do this." };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      instructorId: true,
      start: true,
      refundStatus: true,
      learner: { select: { userId: true } },
    },
  });
  if (!booking) return { error: "Lesson not found." };
  if (booking.instructorId !== instructor.id) {
    return { error: "That isn't your lesson." };
  }

  const claimed = await prisma.booking.updateMany({
    where: { id: bookingId, instructorId: instructor.id, refundStatus: "PENDING" },
    data: { refundStatus: "DECLINED" },
  });
  if (claimed.count === 0) {
    return { error: "There's no refund waiting on this lesson." };
  }

  await sendPushToUser(booking.learner.userId, {
    title: "Refund declined",
    body: `Your instructor declined a refund for the cancelled lesson — ${formatLessonWhen(booking.start)}.`,
    url: "/diary",
    tag: `refund-${bookingId}`,
  });

  revalidatePath("/diary");
  return {};
}

// Instructor edits an unclaimed open slot (time, length, price, notes). Uses an
// atomic guard so a slot claimed/removed in the meantime can't be edited.
export async function updateOpenLesson(
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
  if (!hasFullAccess(accessState(instructor))) return { error: LOCKED_MESSAGE };

  const parsed = openLessonSchema.safeParse({
    start: formData.get("start"),
    durationMins: formData.get("durationMins"),
    price: formData.get("price") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the lesson details.",
    };
  }

  const startDate = new Date(parsed.data.start);
  if (Number.isNaN(startDate.getTime())) {
    return { error: "That date and time didn't look right." };
  }

  const pricePence =
    parsed.data.price != null
      ? Math.round(parsed.data.price * 100)
      : Math.round(instructor.hourlyRate * 100 * (parsed.data.durationMins / 60));

  const res = await prisma.openLesson.updateMany({
    where: { id, instructorId: instructor.id },
    data: {
      start: startDate,
      durationMins: parsed.data.durationMins,
      pricePence,
      notes: parsed.data.notes ?? null,
    },
  });
  if (res.count === 0) redirect("/diary"); // claimed or removed in the meantime

  revalidatePath("/diary");
  redirect("/diary");
}
