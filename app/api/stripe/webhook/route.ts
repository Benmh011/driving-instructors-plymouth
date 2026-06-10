import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe needs the raw body for signature verification, and the SDK needs Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Mirror a Stripe subscription onto the matching instructor profile.
// NOTE (Stripe v22 / Basil): current_period_end now lives on the subscription
// ITEM, not the subscription object.
async function syncSubscription(sub: Stripe.Subscription) {
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

export async function POST(req: Request) {
  if (!stripeConfigured || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const subId =
          typeof s.subscription === "string"
            ? s.subscription
            : s.subscription?.id;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await syncSubscription(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
