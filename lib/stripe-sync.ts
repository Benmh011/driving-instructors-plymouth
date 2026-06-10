import type Stripe from "stripe";
import { stripe } from "./stripe";
import { prisma } from "./prisma";

// Mirror a Stripe subscription onto the matching instructor profile.
// NOTE (Stripe v22 / Basil): current_period_end lives on the subscription ITEM.
export async function syncSubscriptionToDb(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  await prisma.instructorProfile.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionPriceId: item?.price.id ?? null,
      currentPeriodEnd: item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null,
      trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    },
  });
}

// Pull a customer's latest subscription straight from Stripe and sync it.
// Used on the Checkout success page so the UI is correct immediately, without
// waiting for the webhook to be delivered.
export async function reconcileCustomerSubscription(customerId: string) {
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 1,
  });
  const sub = subs.data[0];
  if (sub) await syncSubscriptionToDb(sub);
}
