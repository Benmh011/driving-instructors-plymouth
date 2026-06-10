"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  stripe,
  stripeConfigured,
  STRIPE_PRICE_STANDARD,
  STRIPE_PRICE_FOUNDER,
} from "@/lib/stripe";
import { SITE_URL, TRIAL_DAYS } from "@/lib/constants";
import { isFounderEligible } from "@/lib/subscription";

async function requireInstructor() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!profile) redirect("/dashboard");
  return profile;
}

export async function startCheckout() {
  if (!stripeConfigured) redirect("/dashboard/billing?error=config");
  const profile = await requireInstructor();

  // Ensure a Stripe customer exists for this instructor.
  let customerId = profile.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.user.email,
      name: profile.user.name ?? profile.businessName ?? undefined,
      metadata: { instructorProfileId: profile.id },
    });
    customerId = customer.id;
    await prisma.instructorProfile.update({
      where: { id: profile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const founder = isFounderEligible();
  const price = founder ? STRIPE_PRICE_FOUNDER : STRIPE_PRICE_STANDARD;

  // Record founder status up front so the locked rate shows even before the
  // webhook lands. Stripe remains the source of truth for the actual charge.
  if (founder && !profile.isFounder) {
    await prisma.instructorProfile.update({
      where: { id: profile.id },
      data: { isFounder: true },
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { trial_period_days: TRIAL_DAYS },
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/dashboard/billing?status=success`,
    cancel_url: `${SITE_URL}/dashboard/billing?status=cancelled`,
  });

  if (!checkout.url) redirect("/dashboard/billing?error=checkout");
  redirect(checkout.url);
}

export async function openPortal() {
  if (!stripeConfigured) redirect("/dashboard/billing?error=config");
  const profile = await requireInstructor();
  if (!profile.stripeCustomerId) redirect("/dashboard/billing");

  const portal = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${SITE_URL}/dashboard/billing`,
  });
  redirect(portal.url);
}
