import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { syncSubscriptionToDb } from "@/lib/stripe-sync";
import { prisma } from "@/lib/prisma";

// Stripe needs the raw body for signature verification, and the SDK needs Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
          await syncSubscriptionToDb(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscriptionToDb(event.data.object as Stripe.Subscription);
        break;
      }
      case "account.updated": {
        // A connected (instructor) account's onboarding/verification status
        // changed — refresh our cached Connect flags.
        const acct = event.data.object as Stripe.Account;
        await prisma.instructorProfile.updateMany({
          where: { stripeConnectAccountId: acct.id },
          data: {
            connectDetailsSubmitted: Boolean(acct.details_submitted),
            connectChargesEnabled: Boolean(acct.charges_enabled),
            connectPayoutsEnabled: Boolean(acct.payouts_enabled),
          },
        });
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
