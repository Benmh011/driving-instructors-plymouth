import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Refunding unused prepaid hours.
//
// The credit ledger is minutes-based, but every PURCHASE entry also keeps the
// cash paid (pricePence) and the Stripe payment intent it came from. To refund
// the *unused* portion we treat lessons as consuming the OLDEST hours first
// (FIFO), so the hours still owed map to the most recent purchases — and we
// refund each of those purchases pro-rata against its original card charge.

export type CreditRefundLine = {
  purchaseId: string;
  minutes: number; // unused minutes still owed from this purchase
  pricePence: number; // cash to refund for those minutes
  paymentIntentId: string | null;
  note: string | null;
};

export type CreditRefundPreview = {
  balanceMinutes: number;
  refundableMinutes: number;
  refundablePence: number;
  lines: CreditRefundLine[];
};

export async function previewCreditRefund(
  instructorId: string,
  learnerId: string,
): Promise<CreditRefundPreview> {
  const entries: {
    id: string;
    deltaMinutes: number;
    reason: string;
    pricePence: number | null;
    stripePaymentIntentId: string | null;
    note: string | null;
  }[] = await prisma.creditEntry.findMany({
    where: { instructorId, learnerId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      deltaMinutes: true,
      reason: true,
      pricePence: true,
      stripePaymentIntentId: true,
      note: true,
    },
  });

  const balanceMinutes = entries.reduce((s, e) => s + e.deltaMinutes, 0);
  const purchases = entries.filter((e) => e.reason === "PURCHASE");
  const purchaseMinutes = purchases.reduce((s, e) => s + e.deltaMinutes, 0);

  // Anything that isn't a purchase (lessons drawn down, hours already returned)
  // nets to how many purchased minutes have actually been consumed.
  let consumed = Math.max(0, purchaseMinutes - balanceMinutes);

  const lines: CreditRefundLine[] = [];
  for (const p of purchases) {
    const fromThis = Math.min(consumed, p.deltaMinutes);
    consumed -= fromThis;
    const remaining = p.deltaMinutes - fromThis;
    if (remaining <= 0) continue;
    const unitPence = p.pricePence != null ? p.pricePence / p.deltaMinutes : 0;
    lines.push({
      purchaseId: p.id,
      minutes: remaining,
      pricePence: Math.round(remaining * unitPence),
      paymentIntentId: p.stripePaymentIntentId,
      note: p.note,
    });
  }

  return {
    balanceMinutes,
    refundableMinutes: lines.reduce((s, l) => s + l.minutes, 0),
    refundablePence: lines.reduce((s, l) => s + l.pricePence, 0),
    lines,
  };
}

export type CreditRefundResult = {
  refundedMinutes: number;
  refundedPence: number;
  failures: number;
  error?: string;
};

// Refund a learner's unused prepaid hours to the card that bought them, pro-rata
// against each original block purchase, then remove those hours from the ledger.
// Idempotent per purchase: a deterministic Stripe idempotency key and ledger id
// (crefund_<purchaseId>) mean a retry or double-click can't refund twice.
export async function refundUnusedCredit(
  instructorId: string,
  learnerId: string,
): Promise<CreditRefundResult> {
  const instructor = await prisma.instructorProfile.findUnique({
    where: { id: instructorId },
    select: { stripeConnectAccountId: true },
  });
  const acct = instructor?.stripeConnectAccountId ?? null;

  const preview = await previewCreditRefund(instructorId, learnerId);
  let refundedMinutes = 0;
  let refundedPence = 0;
  let failures = 0;

  for (const line of preview.lines) {
    // Nothing to charge back against (e.g. manually granted credit) — just
    // clear the hours.
    if (!line.paymentIntentId || line.pricePence <= 0 || !acct) {
      if (await removeLine(instructorId, learnerId, line, null)) {
        refundedMinutes += line.minutes;
      }
      continue;
    }
    try {
      const refund = await stripe.refunds.create(
        { payment_intent: line.paymentIntentId, amount: line.pricePence },
        { stripeAccount: acct, idempotencyKey: `crefund_${line.purchaseId}` },
      );
      if (await removeLine(instructorId, learnerId, line, refund.id)) {
        refundedMinutes += line.minutes;
        refundedPence += line.pricePence;
      }
    } catch {
      failures += 1;
    }
  }

  return {
    refundedMinutes,
    refundedPence,
    failures,
    error:
      failures > 0
        ? "Some refunds didn't go through — please try again."
        : undefined,
  };
}

// Remove a refunded purchase's remaining hours from the ledger. Returns false if
// this purchase was already cleared (deterministic id collision), so callers
// don't double-count.
async function removeLine(
  instructorId: string,
  learnerId: string,
  line: CreditRefundLine,
  refundId: string | null,
): Promise<boolean> {
  try {
    await prisma.creditEntry.create({
      data: {
        id: `crefund_${line.purchaseId}`,
        instructorId,
        learnerId,
        deltaMinutes: -line.minutes,
        reason: "REFUND",
        pricePence: refundId && line.pricePence > 0 ? line.pricePence : null,
        stripePaymentIntentId: line.paymentIntentId,
        note: refundId ? "Unused hours refunded to card" : "Unused hours cleared",
      },
    });
    return true;
  } catch {
    return false; // already cleared
  }
}
