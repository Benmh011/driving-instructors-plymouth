import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import EnablePush from "@/components/push/EnablePush";
import PushPrompt from "@/components/push/PushPrompt";
import CollapsiblePanel from "@/components/tax/CollapsiblePanel";
import { ensureInstructorSlug } from "@/lib/slug";
import { isAdminEmail } from "@/lib/admin";
import { blockBookingsEnabled } from "@/lib/flags";
import { accessState } from "@/lib/subscription";
import { creditBalanceMinutes, formatHours } from "@/lib/credit";
import { formatCar } from "@/lib/car";
import SubscriptionBanner from "@/components/billing/SubscriptionBanner";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ joined?: string }>;
}) {
  const { joined } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      learnerProfile: { include: { activeInstructor: { include: { user: true } } } },
      instructorProfile: true,
    },
  });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  const isInstructor = user.role === "INSTRUCTOR";
  const admin = isAdminEmail(user.email);
  const l = user.learnerProfile;
  const i = user.instructorProfile;

  // Subscription status, surfaced as a banner at the top of the dashboard.
  const billing = i ? accessState(i) : "none";
  const instructor = l?.activeInstructor;
  const instructorName = instructor
    ? instructor.businessName || instructor.user.name
    : null;
  const instructorCar = instructor
    ? [formatCar(instructor), instructor.carDetails].filter(Boolean).join(" · ") ||
      null
    : null;

  const publicSlug =
    isInstructor && i
      ? await ensureInstructorSlug({
          id: i.id,
          slug: i.slug,
          businessName: i.businessName,
          user: { name: user.name },
        })
      : null;

  // A learner's active instructor's public profile (for the dashboard link).
  const instructorSlug =
    !isInstructor && instructor
      ? await ensureInstructorSlug({
          id: instructor.id,
          slug: instructor.slug,
          businessName: instructor.businessName,
          user: { name: instructor.user.name },
        })
      : null;

  // Learner snapshot: next lesson, upcoming/unpaid counts, credit balance.
  type NextLesson = {
    start: string | Date;
    instructor: {
      businessName: string | null;
      user: { name: string };
    } | null;
  };
  let nextLesson: NextLesson | null = null;
  let upcomingCount = 0;
  let unpaidPastCount = 0;
  let creditMinutes = 0;
  if (!isInstructor && l) {
    const now = new Date();
    const upcoming: NextLesson[] = await prisma.booking.findMany({
      where: { learnerId: l.id, status: { not: "CANCELLED" }, start: { gte: now } },
      orderBy: { start: "asc" },
      select: {
        start: true,
        instructor: {
          select: { businessName: true, user: { select: { name: true } } },
        },
      },
    });
    upcomingCount = upcoming.length;
    nextLesson = upcoming[0] ?? null;
    unpaidPastCount = await prisma.booking.count({
      where: {
        learnerId: l.id,
        status: { not: "CANCELLED" },
        start: { lt: now },
        paid: false,
      },
    });
    if (blockBookingsEnabled() && l.activeInstructorId) {
      creditMinutes = await creditBalanceMinutes(l.activeInstructorId, l.id);
    }
  }
  const nextInstructorName = nextLesson?.instructor
    ? nextLesson.instructor.businessName || nextLesson.instructor.user.name
    : instructorName;

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        {isInstructor && (
          <div className="mb-6">
            <SubscriptionBanner state={billing} trialEndsAt={i?.trialEndsAt} />
          </div>
        )}

        <PushPrompt />

        <Link
          href="/dashboard/security"
          className={`lift press mb-8 flex items-center justify-between gap-4 rounded-2xl border px-5 py-4 ${
            user.twoFactorEnabled
              ? "border-hairline bg-cream"
              : "border-line/40 bg-line/10"
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-sea"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-[15px] font-semibold text-ink">
                {user.twoFactorEnabled
                  ? "Account security"
                  : "Add two-factor authentication"}
              </p>
              <p className="text-sm text-ink-soft">
                {user.twoFactorEnabled
                  ? "Two-factor is on. Manage it or turn it off here."
                  : "A one-time code at sign-in keeps your account safe even if your password leaks."}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold text-sea">
            {user.twoFactorEnabled ? "Manage \u2192" : "Set up \u2192"}
          </span>
        </Link>

        {joined && instructorName && (
          <div className="mb-8 rounded-2xl border border-sea/30 bg-sea/10 px-5 py-4">
            <p className="text-[15px] font-medium text-ink">
              You&rsquo;re now on {instructorName}&rsquo;s student list.
            </p>
          </div>
        )}

        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
          {isInstructor ? "Instructor account" : "Learner account"}
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome, {user.name.split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Your account is set up. Here&rsquo;s what you told us.
        </p>

        {isInstructor && i && i.adiStatus === "PENDING" && (
          <div className="mt-6 rounded-2xl border border-line/40 bg-line/10 px-5 py-4">
            <p className="text-[15px] font-medium text-ink">
              Your ADI badge is being verified. Your profile appears in the public
              directory once we&rsquo;ve confirmed it against the DVSA register.
            </p>
            <Link
              href="/dashboard/badge"
              className="mt-1 inline-block text-sm font-semibold text-sea link-grow"
            >
              {i.adiBadgeUrl ? "Update your badge photo" : "Upload your ADI badge"} &rarr;
            </Link>
          </div>
        )}
        {isInstructor && i && i.adiStatus === "REJECTED" && (
          <div className="mt-6 rounded-2xl border border-signal/30 bg-signal/10 px-5 py-4">
            <p className="text-[15px] font-medium text-ink">
              We couldn&rsquo;t verify your ADI details. Please upload a clear photo of
              your badge, or get in touch so we can sort it out.
            </p>
            <Link
              href="/dashboard/badge"
              className="mt-1 inline-block text-sm font-semibold text-sea link-grow"
            >
              Upload your ADI badge &rarr;
            </Link>
          </div>
        )}
        {isInstructor && i && i.adiStatus === "VERIFIED" && (
          <div className="mt-6 rounded-2xl border border-go/30 bg-go/10 px-5 py-4">
            <p className="text-[15px] font-medium text-ink">
              Your ADI registration is verified &mdash; you&rsquo;re live in the
              directory.
            </p>
          </div>
        )}

        {isInstructor && i ? (
          <CollapsiblePanel title="Profile settings">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field label="ADI badge number" value={i.adiNumber} />
              <Field label="Areas covered" value={i.postcodes} />
              <Field label="Transmission" value={pretty(i.transmission)} />
              <Field label="Hourly rate" value={`£${i.hourlyRate}`} />
              {i.businessName && <Field label="Business" value={i.businessName} />}
              {(formatCar(i) || i.carDetails) && (
                <Field
                  label="Car"
                  value={[formatCar(i), i.carDetails].filter(Boolean).join(" · ")}
                />
              )}
            </dl>
            <p className="mt-4 text-sm text-ink-soft">
              Your ADI badge number is tied to DVSA verification and can&rsquo;t be edited
              here.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard/profile"
                className="rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
              >
                Edit your details
              </Link>
              {publicSlug && (
                <a
                  href={`/instructors/${publicSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                >
                  View public profile &#8599;
                </a>
              )}
            </div>
          </CollapsiblePanel>
        ) : l ? (
          <>
            {nextLesson ? (
              <Link
                href="/diary"
                className="lift press mt-8 block rounded-2xl border border-sea/30 bg-sea/10 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sea">
                  Next lesson
                </p>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight">
                  {fmtWhen(nextLesson.start)}
                </p>
                <p className="mt-1 text-ink-soft">
                  {nextInstructorName ? `with ${nextInstructorName} · ` : ""}
                  {countdown(nextLesson.start)}
                </p>
              </Link>
            ) : instructorName ? (
              <div className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
                <p className="font-display text-xl font-semibold">
                  No lessons booked
                </p>
                <p className="mt-1 text-ink-soft">
                  Book your next lesson with {instructorName} in your diary.
                </p>
                <Link
                  href="/diary"
                  className="mt-4 inline-flex items-center rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
                >
                  Go to diary &rarr;
                </Link>
              </div>
            ) : null}

            {instructorName && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Upcoming" value={String(upcomingCount)} href="/diary" />
                <Stat
                  label="Unpaid"
                  value={String(unpaidPastCount)}
                  href="/diary"
                  accent={unpaidPastCount > 0}
                />
                {blockBookingsEnabled() && (
                  <Stat
                    label="Lesson credit"
                    value={formatHours(creditMinutes)}
                    href="/credit"
                  />
                )}
              </div>
            )}
          </>
        ) : null}

        {isInstructor ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NavCard
              href="/students"
              title="Your students"
              desc="Share your invite link and manage your roster."
            />
            <NavCard
              href="/diary"
              title="Your diary"
              desc="Book and manage your lessons."
            />
            <NavCard
              href="/dashboard/payments"
              title="Payments"
              desc={
                i?.connectChargesEnabled
                  ? "Manage card payments and payouts."
                  : "Set up card payments from learners."
              }
            />
            <NavCard
              href="/dashboard/tax"
              title="Tax & earnings"
              desc="Income and expenses for Self Assessment."
            />
            {blockBookingsEnabled() && (
              <NavCard
                href="/dashboard/blocks"
                title="Block packages"
                desc="Sell blocks of hours your students can buy up front."
              />
            )}
            {blockBookingsEnabled() && (
              <NavCard
                href="/dashboard/credit"
                title="Prepaid credit"
                desc="See unused hours and refund them when lessons stop."
              />
            )}
            <NavCard
              href="/messages"
              title="Messages"
              desc="Message your students."
            />
            <NavCard
              href="/theory/review"
              title="Theory questions"
              desc="View the question bank and flag anything that needs fixing."
            />
          </div>
        ) : instructorName ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {instructorSlug && (
              <NavCard
                href={`/instructors/${instructorSlug}`}
                title="Your instructor"
                desc={`View ${instructorName}'s profile and leave a review.`}
              />
            )}
            <NavCard
              href="/diary"
              title="Your lessons"
              desc={`See your lessons with ${instructorName}.`}
            />
            <NavCard
              href="/messages"
              title="Messages"
              desc={`Message ${instructorName}.`}
            />
            <NavCard
              href="/theory"
              title="Theory test"
              desc="Practise by topic and sit timed mock tests."
            />
            {blockBookingsEnabled() && (
              <NavCard
                href="/credit"
                title="Lesson credit"
                desc="Buy a block of hours and see your balance."
              />
            )}
          </div>
        ) : (
          <NavCard
            href="/instructors"
            title="Find an instructor"
            desc="Browse approved instructors near you and request lessons."
            className="mt-5"
          />
        )}

        {!isInstructor && l && (
          <div className="mt-5">
            <CollapsiblePanel title="Your details">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                <Field label="Area" value={l.postcode} />
                <Field label="Transmission" value={pretty(l.transmission)} />
                {l.goal && <Field label="Goal" value={l.goal} />}
                <Field
                  label="Your instructor"
                  value={instructorName ?? "Not joined yet"}
                />
                {instructorCar && (
                  <Field label="Their car" value={instructorCar} />
                )}
              </dl>
            </CollapsiblePanel>
          </div>
        )}

        <div className="mt-5">
          <EnablePush />
        </div>

        {admin && (
          <Link
            href="/admin"
            className="mt-8 inline-block text-sm font-semibold text-sea link-grow"
          >
            Admin &rarr;
          </Link>
        )}
      </main>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  className = "",
}: {
  href: string;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl border border-hairline bg-cream p-6 hover:border-ink/30 lift press ${className}`}
    >
      <div>
        <p className="font-display text-lg font-semibold">{title}</p>
        <p className="mt-1 text-[15px] text-ink-soft">{desc}</p>
      </div>
      <span className="ml-4 shrink-0 text-2xl text-ink-soft" aria-hidden>
        &rarr;
      </span>
    </Link>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          accent ? "text-signal" : ""
        }`}
      >
        {value}
      </p>
    </>
  );
  const base = `rounded-2xl border bg-cream p-5 ${
    accent ? "border-signal/40" : "border-hairline"
  }`;
  return href ? (
    <Link href={href} className={`lift block ${base}`}>
      {inner}
    </Link>
  ) : (
    <div className={base}>{inner}</div>
  );
}

function fmtWhen(d: string | Date) {
  return new Date(d).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

function countdown(d: string | Date) {
  const target = new Date(d);
  const now = new Date();
  const t = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  const n = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((t - n) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "in 1 week" : `in ${weeks} weeks`;
}

function pretty(t: string) {
  return t === "BOTH" ? "Either" : t.charAt(0) + t.slice(1).toLowerCase();
}
