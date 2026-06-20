"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { canAcceptPayments } from "@/lib/connect";
import { SITE_URL } from "@/lib/constants";
import { blockBookingsEnabled } from "@/lib/flags";

// Start a Connect checkout for a learner to buy one of their instructor's
// block packages. Mirrors the single-lesson pay flow: a DIRECT charge created
// on the instructor's connected account.
export async function buyBlock(
  packageId: string,
): Promise<{ url?: string; error?: string }> {
  if (!blockBookingsEnabled()) return { error: "Blocks aren't available." };

  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };
  if (!stripeConfigured) {
    return { error: "Card payments aren't available right now." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      learnerProfile: { select: { id: true, activeInstructorId: true } },
    },
  });
  const learner = user?.learnerProfile;
  if (!learner) return { error: "Only students can buy blocks." };
  if (!learner.activeInstructorId) {
    return { error: "Join an instructor before buying a block." };
  }

  const pkg = await prisma.blockPackage.findFirst({
    where: {
      id: packageId,
      instructorId: learner.activeInstructorId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      minutes: true,
      pricePence: true,
      instructor: {
        select: {
          id: true,
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
  if (!pkg) return { error: "That block isn't available." };
  if (pkg.pricePence < 30) return { error: "That block can't be purchased." };

  const inst = pkg.instructor;
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
              unit_amount: pkg.pricePence,
              product_data: { name: `${pkg.name} — ${instructorName}` },
            },
          },
        ],
        success_url: `${SITE_URL}/credit?bought={CHECKOUT_SESSION_ID}`,
        cancel_url: `${SITE_URL}/credit?buy=cancelled`,
        metadata: {
          kind: "block",
          packageId: pkg.id,
          learnerId: learner.id,
          instructorId: inst.id,
          minutes: String(pkg.minutes),
          packageName: pkg.name,
        },
        payment_intent_data: {
          metadata: {
            kind: "block",
            learnerId: learner.id,
            instructorId: inst.id,
          },
        },
      },
      // {stripeAccount} → a DIRECT charge on the instructor's connected account.
      { stripeAccount: acct },
    );

    if (!checkout.url) {
      return { error: "Couldn't start checkout. Please try again." };
    }
    return { url: checkout.url };
  } catch {
    return { error: "Couldn't start checkout. Please try again." };
  }
}
