import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import { blockBookingsEnabled } from "@/lib/flags";
import { creditBalanceMinutes, formatHours } from "@/lib/credit";
import { canAcceptPayments } from "@/lib/connect";
import { reconcileBlockPurchase } from "@/lib/block-pay";
import BuyBlockButton from "@/components/blocks/BuyBlockButton";

export const metadata = { title: "Lesson credit" };
export const dynamic = "force-dynamic";

function money(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

function activityLabel(e: {
  reason: string;
  deltaMinutes: number;
  note: string | null;
}): string {
  switch (e.reason) {
    case "PURCHASE":
      return e.note ? `Bought · ${e.note}` : "Bought hours";
    case "LESSON":
      return "Lesson";
    case "REFUND":
      return e.deltaMinutes < 0 ? "Refunded to your card" : "Hours returned";
    default:
      return "Adjustment";
  }
}

export default async function CreditPage({
  searchParams,
}: {
  searchParams: Promise<{ bought?: string; buy?: string }>;
}) {
  if (!blockBookingsEnabled()) redirect("/dashboard");

  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      learnerProfile: { select: { id: true, activeInstructorId: true } },
    },
  });
  const learner = user?.learnerProfile;
  if (!learner) redirect("/dashboard");

  // Just back from checkout — verify and credit before we read the balance, so
  // the hours show immediately rather than waiting on the webhook.
  if (sp.bought) {
    await reconcileBlockPurchase(sp.bought, session.user.id);
  }

  const instructor = learner.activeInstructorId
    ? await prisma.instructorProfile.findUnique({
        where: { id: learner.activeInstructorId },
        select: {
          id: true,
          businessName: true,
          connectChargesEnabled: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          currentPeriodEnd: true,
          stripeConnectAccountId: true,
          user: { select: { name: true } },
          blockPackages: {
            where: { active: true },
            orderBy: { pricePence: "asc" },
            select: { id: true, name: true, minutes: true, pricePence: true },
          },
        },
      })
    : null;

  const balanceMins = instructor
    ? await creditBalanceMinutes(instructor.id, learner.id)
    : 0;
  const instructorName = instructor
    ? instructor.businessName || instructor.user.name || "your instructor"
    : null;
  const canPay = instructor
    ? !!instructor.stripeConnectAccountId &&
      canAcceptPayments({
        connectChargesEnabled: instructor.connectChargesEnabled,
        subscriptionStatus: instructor.subscriptionStatus,
        trialEndsAt: instructor.trialEndsAt,
        currentPeriodEnd: instructor.currentPeriodEnd,
      })
    : false;
  const packages: { id: string; name: string; minutes: number; pricePence: number }[] =
    instructor?.blockPackages ?? [];

  const activity: {
    id: string;
    deltaMinutes: number;
    reason: string;
    pricePence: number | null;
    note: string | null;
    createdAt: Date | string;
  }[] = instructor
    ? await prisma.creditEntry.findMany({
        where: { instructorId: instructor.id, learnerId: learner.id },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          deltaMinutes: true,
          reason: true,
          pricePence: true,
          note: true,
          createdAt: true,
        },
      })
    : [];

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <BackLink />

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Lesson credit
        </h1>

        {sp.bought && (
          <div className="mt-5 rounded-2xl border border-go/40 bg-go/10 p-4 text-sm font-medium text-ink">
            Payment received — your hours have been added to your balance.
          </div>
        )}
        {sp.buy === "cancelled" && (
          <div className="mt-5 rounded-2xl border border-hairline bg-cream p-4 text-sm text-ink-soft">
            Purchase cancelled — nothing was charged.
          </div>
        )}

        {!instructor ? (
          <p className="mt-6 text-[15px] text-ink-soft">
            You&rsquo;ll be able to buy lesson credit once you&rsquo;re with an
            instructor.{" "}
            <Link href="/instructors" className="font-semibold text-sea link-grow">
              Find an instructor
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-hairline bg-cream p-6">
              <p className="text-sm text-ink-soft">
                Your balance with {instructorName}
              </p>
              <p className="mt-1 font-display text-3xl font-bold">
                {formatHours(balanceMins)}
              </p>
            </div>

            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold">Buy a block</h2>
              {!canPay ? (
                <p className="mt-3 text-[15px] text-ink-soft">
                  {instructorName} isn&rsquo;t set up to take card payments yet,
                  so blocks can&rsquo;t be bought online right now.
                </p>
              ) : packages.length === 0 ? (
                <p className="mt-3 text-[15px] text-ink-soft">
                  {instructorName} hasn&rsquo;t put any blocks up for sale yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {packages.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5"
                    >
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">
                          {formatHours(p.minutes)} · {money(p.pricePence)}
                        </p>
                      </div>
                      <BuyBlockButton
                        packageId={p.id}
                        label={`Buy · ${money(p.pricePence)}`}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {activity.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-lg font-semibold">
                  Recent activity
                </h2>
                <ul className="mt-4 divide-y divide-hairline rounded-2xl border border-hairline bg-cream">
                  {activity.map((e) => {
                    const positive = e.deltaMinutes >= 0;
                    return (
                      <li
                        key={e.id}
                        className="flex items-center justify-between gap-4 px-5 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {activityLabel(e)}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {new Date(e.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {e.pricePence != null && <> · {money(e.pricePence)}</>}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-semibold ${
                            positive ? "text-go" : "text-ink-soft"
                          }`}
                        >
                          {positive ? "+" : "−"}
                          {formatHours(Math.abs(e.deltaMinutes))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
