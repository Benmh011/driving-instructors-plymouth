import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { stripe, stripeConfigured } from "@/lib/stripe";
import { syncSubscriptionToDb } from "@/lib/stripe-sync";
import { prisma } from "@/lib/prisma";
import { markBookingPaidFromSession } from "@/lib/lesson-pay";
import { grantCreditFromSession } from "@/lib/block-pay";

// Stripe needs the raw body for signature verification, and the SDK needs Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
// Connected-account events (e.g. direct-charge lesson payments) arrive from a
// separate Connect-scoped endpoint with its own signing secret.
const connectWebhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

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

  let event: Stripe.Event | null = null;
  // The same URL backs two Stripe endpoints — one scoped to your account, one
  // to connected accounts — each with its own signing secret. Try both.
  const secrets = [webhookSecret, connectWebhookSecret].filter(
    (s): s is string => Boolean(s),
  );
  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
      break;
    } catch {
      // wrong secret for this event — try the next one
    }
  }
  if (!event) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;

        // Single-lesson payment (direct charge on a connected account).
        if (s.metadata?.bookingId) {
          await markBookingPaidFromSession(s.metadata.bookingId, s);
          break;
        }

        // Block-credit purchase (direct charge on a connected account).
        if (s.metadata?.kind === "block") {
          await grantCreditFromSession(s);
          break;
        }

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
