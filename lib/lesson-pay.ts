import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function paymentIntentIdOf(s: Stripe.Checkout.Session): string | null {
  return typeof s.payment_intent === "string"
    ? s.payment_intent
    : (s.payment_intent?.id ?? null);
}

// Mark a booking paid from a completed checkout session.
// Idempotent: only flips rows that are still unpaid, so calling it from both
// the success-return verification AND the webhook can't double-apply.
export async function markBookingPaidFromSession(
  bookingId: string,
  s: Stripe.Checkout.Session,
): Promise<void> {
  await prisma.booking.updateMany({
    where: { id: bookingId, paid: false },
    data: {
      paid: true,
      paidAt: new Date(),
      stripePaymentIntentId: paymentIntentIdOf(s),
    },
  });
}

// Reconcile a checkout session (by id) against its booking and mark paid if
// Stripe confirms payment. Called on the success return so the lesson shows
// paid immediately, with the webhook as a backup for closed-tab cases.
// Returns true if the lesson is paid (now or already).
export async function reconcileCheckoutSession(
  sessionId: string,
  learnerUserId: string,
): Promise<boolean> {
  const booking = await prisma.booking.findFirst({
    where: {
      stripeCheckoutSessionId: sessionId,
      learner: { userId: learnerUserId },
    },
    select: {
      id: true,
      paid: true,
      instructor: { select: { stripeConnectAccountId: true } },
    },
  });
  if (!booking) return false;
  if (booking.paid) return true;

  const acct = booking.instructor.stripeConnectAccountId;
  if (!acct) return false;

  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId, undefined, {
      stripeAccount: acct,
    });
    if (s.payment_status === "paid") {
      await markBookingPaidFromSession(booking.id, s);
      return true;
    }
  } catch {
    // Couldn't verify right now — the webhook is the backup.
  }
  return false;
}
