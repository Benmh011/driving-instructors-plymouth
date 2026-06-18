import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { accessState, hasFullAccess } from "@/lib/subscription";

const RETURN_PATH = "/dashboard/payments";

export type ConnectStatus = {
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
};

// Create the instructor's Express account if they don't have one yet; returns
// the account id either way.
export async function ensureConnectAccount(profile: {
  id: string;
  stripeConnectAccountId: string | null;
  email: string;
}): Promise<string> {
  if (profile.stripeConnectAccountId) return profile.stripeConnectAccountId;

  const account = await stripe.accounts.create({
    type: "express",
    country: "GB",
    email: profile.email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_profile: { product_description: "Driving lessons" },
    metadata: { instructorProfileId: profile.id },
  });

  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: { stripeConnectAccountId: account.id },
  });
  return account.id;
}

// A single-use, Stripe-hosted onboarding link. Used to both start and resume
// onboarding (Stripe picks up wherever they left off).
export async function createOnboardingLink(accountId: string): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${SITE_URL}${RETURN_PATH}?refresh=1`,
    return_url: `${SITE_URL}${RETURN_PATH}?done=1`,
    type: "account_onboarding",
  });
  return link.url;
}

// Pull live status from Stripe and cache it on the profile.
export async function syncConnectStatus(
  profileId: string,
  accountId: string,
): Promise<ConnectStatus> {
  const acct = await stripe.accounts.retrieve(accountId);
  const status: ConnectStatus = {
    detailsSubmitted: Boolean(acct.details_submitted),
    chargesEnabled: Boolean(acct.charges_enabled),
    payoutsEnabled: Boolean(acct.payouts_enabled),
  };
  await prisma.instructorProfile.update({
    where: { id: profileId },
    data: {
      connectDetailsSubmitted: status.detailsSubmitted,
      connectChargesEnabled: status.chargesEnabled,
      connectPayoutsEnabled: status.payoutsEnabled,
    },
  });
  return status;
}

// Login link to the instructor's own Express dashboard (balance, payouts).
export async function expressLoginLink(accountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(accountId);
  return link.url;
}

// The gate Phase 2 will use before showing "Book & pay" / creating a charge:
// the instructor must be on an active subscription AND fully onboarded to Stripe.
export function canAcceptPayments(profile: {
  subscriptionStatus?: string | null;
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
  connectChargesEnabled: boolean;
}): boolean {
  return profile.connectChargesEnabled && hasFullAccess(accessState(profile));
}
