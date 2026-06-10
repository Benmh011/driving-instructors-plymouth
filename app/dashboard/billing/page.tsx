import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { accessState, isFounderEligible } from "@/lib/subscription";
import {
  STANDARD_PRICE_PENCE,
  FOUNDER_PRICE_PENCE,
  TRIAL_DAYS,
  FOUNDER_WINDOW_END,
} from "@/lib/constants";
import { stripeConfigured } from "@/lib/stripe";
import { startCheckout, openPortal } from "./actions";

function money(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function daysUntil(d: Date | null | undefined) {
  if (!d) return 0;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
}

const card = "rounded-2xl border border-hairline bg-cream p-6";
const primaryBtn =
  "inline-flex items-center justify-center rounded-full bg-sea px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea-dark";
const secondaryBtn =
  "inline-flex items-center justify-center rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/dashboard");

  const state = accessState(profile);
  const pricePence = profile.isFounder ? FOUNDER_PRICE_PENCE : STANDARD_PRICE_PENCE;
  const trialLeft = daysUntil(profile.trialEndsAt);
  const renews = fmtDate(profile.currentPeriodEnd);

  // For the pre-subscribe pitch: an eligible instructor would actually be
  // charged the founder rate, so show that (not the standard price).
  const founderEligible = isFounderEligible();
  const pitchPence = founderEligible ? FOUNDER_PRICE_PENCE : STANDARD_PRICE_PENCE;

  const included = [
    "Manage your students and roster in one place",
    "Take, schedule and track lesson bookings",
    "Get matched with new local learners",
    "Message your pupils directly",
    "Income & expenses ready for Self Assessment",
    "Automatic lesson reminders for learners",
  ];

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-8">
      <h1 className="font-display text-3xl font-bold text-ink">Subscription</h1>
      <p className="mt-1 text-ink-soft">
        Your Driving Instructors Plymouth membership.
      </p>

      {sp.status === "success" && (
        <div className="mt-5 rounded-xl border border-go/40 bg-go/10 px-4 py-3 text-sm text-ink">
          You&rsquo;re all set — your subscription is live.
        </div>
      )}
      {sp.status === "cancelled" && (
        <div className="mt-5 rounded-xl border border-hairline bg-paper px-4 py-3 text-sm text-ink-soft">
          Checkout cancelled — no charge was made.
        </div>
      )}
      {sp.error && (
        <div className="mt-5 rounded-xl border border-signal/40 bg-signal/10 px-4 py-3 text-sm text-ink">
          Something went wrong starting that. Please try again in a moment.
        </div>
      )}

      {!stripeConfigured && (
        <div className="mt-5 rounded-xl border border-line/60 bg-line/10 px-4 py-3 text-sm text-ink">
          Billing isn&rsquo;t switched on yet. Check back shortly.
        </div>
      )}

      <div className="mt-6 space-y-5">
        {state === "none" && (
          <div className={card}>
            {founderEligible && (
              <span className="inline-flex items-center rounded-full bg-line/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                ★ Founder price
              </span>
            )}

            <h2 className="mt-3 font-display text-2xl font-bold text-ink">
              Run your whole driving business from one place
            </h2>
            <p className="mt-2 text-[15px] text-ink-soft">
              Your diary, your students, your earnings and a steady stream of
              new local learners — all in your pocket, with none of the Sunday-night
              admin.
            </p>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-ink">
                {money(pitchPence)}
                <span className="text-base font-normal text-ink-soft"> / month</span>
              </span>
              {founderEligible && (
                <span className="text-base text-ink-soft line-through">
                  {money(STANDARD_PRICE_PENCE)}
                </span>
              )}
            </div>
            {founderEligible && (
              <p className="mt-1 text-sm text-ink-soft">
                Lock in the founder rate for as long as you stay subscribed —
                available until {fmtDate(FOUNDER_WINDOW_END)}.
              </p>
            )}

            <ul className="mt-5 space-y-2.5">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] text-ink">
                  <span className="mt-0.5 text-go" aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-hairline bg-paper/60 px-4 py-3 text-[15px] text-ink-soft">
              Start with a{" "}
              <strong className="text-ink">{TRIAL_DAYS}-day free trial</strong>.
              Nothing&rsquo;s charged today, and you can cancel any time before it
              ends.
            </div>

            <form action={startCheckout} className="mt-5">
              <button type="submit" className={primaryBtn}>
                Start my {TRIAL_DAYS}-day free trial
              </button>
            </form>
          </div>
        )}

        {state === "trialing" && (
          <div className={card}>
            <p className="text-sm font-semibold uppercase tracking-wide text-sea">
              Free trial
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {trialLeft} {trialLeft === 1 ? "day" : "days"} left
            </p>
            <p className="mt-2 text-[15px] text-ink-soft">
              Your trial ends on <strong className="text-ink">{fmtDate(profile.trialEndsAt)}</strong>,
              when your subscription begins at {money(pricePence)}/month
              {profile.cancelAtPeriodEnd
                ? " — unless you cancel first (your trial is set to end without renewing)."
                : "."}
            </p>
            <form action={openPortal} className="mt-5">
              <button type="submit" className={secondaryBtn}>
                Manage billing
              </button>
            </form>
          </div>
        )}

        {state === "active" && (
          <div className={card}>
            <p className="text-sm font-semibold uppercase tracking-wide text-go">
              Active
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              {money(pricePence)}
              <span className="text-base font-normal text-ink-soft"> / month</span>
            </p>
            <p className="mt-2 text-[15px] text-ink-soft">
              {profile.cancelAtPeriodEnd
                ? `Your subscription ends on ${renews} and won't renew.`
                : `Renews on ${renews}.`}
              {profile.isFounder && " You're on the locked founder rate."}
            </p>
            <form action={openPortal} className="mt-5">
              <button type="submit" className={secondaryBtn}>
                Manage billing
              </button>
            </form>
          </div>
        )}

        {state === "past_due" && (
          <div className={card}>
            <p className="text-sm font-semibold uppercase tracking-wide text-signal">
              Payment failed
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              Update your card
            </p>
            <p className="mt-2 text-[15px] text-ink-soft">
              We couldn&rsquo;t take your last payment. You still have full
              access for a few days — update your payment method to keep it.
            </p>
            <form action={openPortal} className="mt-5">
              <button type="submit" className={primaryBtn}>
                Update payment method
              </button>
            </form>
          </div>
        )}

        {state === "locked" && (
          <div className={card}>
            <p className="text-sm font-semibold uppercase tracking-wide text-signal">
              Subscription ended
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-ink">
              Resubscribe to unlock
            </p>
            <p className="mt-2 text-[15px] text-ink-soft">
              Your existing lessons and students are still here — resubscribe to
              manage your diary, take new bookings and message learners again.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={startCheckout}>
                <button type="submit" className={primaryBtn}>
                  Resubscribe — {money(pricePence)}/month
                </button>
              </form>
              {profile.stripeCustomerId && (
                <form action={openPortal}>
                  <button type="submit" className={secondaryBtn}>
                    Billing history
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
