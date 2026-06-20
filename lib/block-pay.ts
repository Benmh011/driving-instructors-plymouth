import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function paymentIntentIdOf(s: Stripe.Checkout.Session): string | null {
  return typeof s.payment_intent === "string"
    ? s.payment_intent
    : (s.payment_intent?.id ?? null);
}

// Grant prepaid credit from a completed block-purchase checkout session.
// Idempotent: the ledger entry id is derived from the session id, so the
// webhook and the success-return verification can never double-credit.
export async function grantCreditFromSession(
  s: Stripe.Checkout.Session,
): Promise<void> {
  const md = s.metadata ?? {};
  if (md.kind !== "block") return;
  if (s.payment_status !== "paid") return;

  const learnerId = md.learnerId;
  const instructorId = md.instructorId;
  const minutes = Number(md.minutes);
  if (!learnerId || !instructorId || !Number.isFinite(minutes) || minutes <= 0) {
    return;
  }

  const entryId = `pur_${s.id}`;
  const already = await prisma.creditEntry.findUnique({ where: { id: entryId } });
  if (already) return;

  try {
    await prisma.creditEntry.create({
      data: {
        id: entryId,
        instructorId,
        learnerId,
        deltaMinutes: minutes,
        reason: "PURCHASE",
        pricePence: typeof s.amount_total === "number" ? s.amount_total : null,
        stripeCheckoutSessionId: s.id,
        stripePaymentIntentId: paymentIntentIdOf(s),
        note: md.packageName ?? null,
      },
    });
  } catch {
    // Lost a race with the other grant path — already credited. No-op.
  }
}

// Reconcile a block-purchase session on the success return, so the credit shows
// immediately without waiting on the webhook. Only credits a session that
// belongs to the signed-in learner.
export async function reconcileBlockPurchase(
  sessionId: string,
  learnerUserId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: learnerUserId },
    select: {
      learnerProfile: { select: { id: true, activeInstructorId: true } },
    },
  });
  const learner = user?.learnerProfile;
  if (!learner?.activeInstructorId) return;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { id: learner.activeInstructorId },
    select: { stripeConnectAccountId: true },
  });
  const acct = instructor?.stripeConnectAccountId;
  if (!acct) return;

  try {
    const s = await stripe.checkout.sessions.retrieve(sessionId, undefined, {
      stripeAccount: acct,
    });
    if (s.metadata?.learnerId !== learner.id) return;
    await grantCreditFromSession(s);
  } catch {
    // Couldn't verify now — the webhook is the backup.
  }
}
