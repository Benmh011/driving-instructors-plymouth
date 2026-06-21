import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import { stripeConfigured } from "@/lib/stripe";
import { syncConnectStatus } from "@/lib/connect";
import { accessState, hasFullAccess } from "@/lib/subscription";
import { startConnectOnboarding, openExpressDashboard } from "./actions";

export const metadata = { title: "Payments" };

const card = "rounded-2xl border border-hairline bg-cream p-6";
const btn =
  "press inline-flex rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark";
const ghost =
  "press inline-flex rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      stripeConnectAccountId: true,
      connectChargesEnabled: true,
      connectPayoutsEnabled: true,
      connectDetailsSubmitted: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
    },
  });
  // Payments is an instructor-only feature.
  if (!profile) redirect("/dashboard");

  // Keep the cached flags fresh — especially right after returning from Stripe,
  // before the webhook has necessarily landed.
  let chargesEnabled = profile.connectChargesEnabled;
  let payoutsEnabled = profile.connectPayoutsEnabled;
  let detailsSubmitted = profile.connectDetailsSubmitted;
  if (stripeConfigured && profile.stripeConnectAccountId) {
    try {
      const s = await syncConnectStatus(profile.id, profile.stripeConnectAccountId);
      chargesEnabled = s.chargesEnabled;
      payoutsEnabled = s.payoutsEnabled;
      detailsSubmitted = s.detailsSubmitted;
    } catch {
      // Fall back to cached values if Stripe is briefly unreachable.
    }
  }

  const subscribed = hasFullAccess(accessState(profile));
  const started = Boolean(profile.stripeConnectAccountId);

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <BackLink />

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">Payments</h1>
        <p className="mt-2 text-ink-soft">
          Take card payments from learners for lessons, paid straight into your
          bank by Stripe.
        </p>

        <div className="mt-8">
          {!subscribed ? (
            <div className={card}>
              <p className="font-semibold text-ink">Payments is part of your subscription</p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Resubscribe to set up card payments from learners.
              </p>
              <Link href="/dashboard/billing" className={`mt-4 ${btn}`}>
                Go to billing
              </Link>
            </div>
          ) : chargesEnabled ? (
            <div className={card}>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-go" />
                <p className="font-semibold text-ink">You&apos;re set up to take payments</p>
              </div>
              <p className="mt-1.5 text-sm text-ink-soft">
                {payoutsEnabled
                  ? "Learners can pay you by card, and payouts land in your bank automatically."
                  : "Learners can pay you by card. Stripe is still finishing off your payouts setup."}
              </p>
              <form action={openExpressDashboard} className="mt-4">
                <button type="submit" className={ghost}>
                  View payouts &amp; earnings
                </button>
              </form>
            </div>
          ) : started && detailsSubmitted ? (
            <div className={card}>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-line" />
                <p className="font-semibold text-ink">Stripe is verifying your details</p>
              </div>
              <p className="mt-1.5 text-sm text-ink-soft">
                You&apos;ve submitted everything — Stripe is reviewing it, which can
                take a little while. This page updates itself once you&apos;re
                approved, so just check back.
              </p>
            </div>
          ) : started ? (
            <div className={card}>
              <p className="font-semibold text-ink">Finish setting up payments</p>
              <p className="mt-1.5 text-sm text-ink-soft">
                You started connecting your bank but didn&apos;t finish. Pick up
                where you left off.
              </p>
              <form action={startConnectOnboarding} className="mt-4">
                <button type="submit" className={btn}>
                  Continue setup
                </button>
              </form>
            </div>
          ) : (
            <div className={card}>
              <p className="font-semibold text-ink">Set up payments</p>
              <p className="mt-1.5 text-sm text-ink-soft">
                Connect your bank through Stripe so learners can pay you by card
                in the app. It takes a couple of minutes — have your bank details
                and a form of ID handy.
              </p>
              <form action={startConnectOnboarding} className="mt-4">
                <button type="submit" className={btn}>
                  Set up payments
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-ink-soft">
          Payments are handled securely by Stripe — we never see or store your
          bank or card details.
        </p>
      </main>
    </div>
  );
}
