import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureInstructorSlug } from "@/lib/slug";
import { accessState, hasFullAccess } from "@/lib/subscription";
import { canAcceptPayments } from "@/lib/connect";
import { reconcileCheckoutSession } from "@/lib/lesson-pay";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import InstructorDiary from "@/components/diary/InstructorDiary";
import LessonCalendar, { type CalLesson } from "@/components/diary/LessonCalendar";

export const metadata = { title: "Diary" };

// Always render fresh per-request: the diary is per-user and changes often, so
// it must never be served from a stale route/client cache (e.g. after booking
// a lesson or switching accounts in the same tab).
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  start: string | Date;
  durationMins: number;
  status: string;
  notes: string | null;
  paid: boolean;
  pricePence: number | null;
  learner?: { user: { name: string } };
  instructor?: {
    id: string;
    slug: string | null;
    user: { name: string };
    businessName: string | null;
    cancellationNoticeHours: number;
    connectChargesEnabled: boolean;
    subscriptionStatus: string | null;
    trialEndsAt: Date | null;
    currentPeriodEnd: Date | null;
  };
};

function fmtPast(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; pay?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      instructorProfile: {
        include: { roster: { include: { user: true }, orderBy: { createdAt: "asc" } } },
      },
      learnerProfile: true,
    },
  });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  const isInstructor = user.role === "INSTRUCTOR";
  const instructorLocked =
    isInstructor && user.instructorProfile
      ? !hasFullAccess(accessState(user.instructorProfile))
      : false;

  // Returning from Stripe Checkout: verify the payment now so the lesson shows
  // as paid immediately, without waiting on the webhook. sp.paid is the
  // checkout session id (older links may send "1", which we simply skip).
  if (!isInstructor && sp.paid && sp.paid !== "1") {
    await reconcileCheckoutSession(sp.paid, session.user.id);
  }

  let bookings: Row[] = [];
  if (isInstructor && user.instructorProfile) {
    bookings = await prisma.booking.findMany({
      where: { instructorId: user.instructorProfile.id },
      include: { learner: { include: { user: true } } },
      orderBy: { start: "asc" },
    });
  } else if (user.learnerProfile) {
    bookings = await prisma.booking.findMany({
      where: { learnerId: user.learnerProfile.id },
      include: { instructor: { include: { user: true } } },
      orderBy: { start: "asc" },
    });
  }

  const ownNotice = user.instructorProfile?.cancellationNoticeHours ?? 48;

  const lessons: CalLesson[] = bookings.map((b) => ({
    id: b.id,
    start: new Date(b.start).toISOString(),
    durationMins: b.durationMins,
    status: b.status,
    other: isInstructor
      ? (b.learner?.user.name ?? "Student")
      : (b.instructor?.businessName || b.instructor?.user.name || "Instructor"),
    notes: b.notes ?? null,
    noticeHours: isInstructor
      ? ownNotice
      : (b.instructor?.cancellationNoticeHours ?? 48),
    paid: b.paid,
    pricePence: b.pricePence ?? null,
    canPay:
      !isInstructor &&
      !b.paid &&
      b.status !== "CANCELLED" &&
      b.pricePence != null &&
      b.pricePence > 0 &&
      b.instructor != null &&
      canAcceptPayments({
        connectChargesEnabled: b.instructor.connectChargesEnabled,
        subscriptionStatus: b.instructor.subscriptionStatus,
        trialEndsAt: b.instructor.trialEndsAt,
        currentPeriodEnd: b.instructor.currentPeriodEnd,
      }),
  }));

  const rosterRaw: { id: string; user: { name: string } }[] =
    user.instructorProfile?.roster ?? [];
  const roster = rosterRaw.map((r) => ({ id: r.id, name: r.user.name }));

  // Learner's completed lessons (newest first), each linking to the instructor's profile.
  type PastLesson = { id: string; start: string; instructorName: string; slug: string };
  const pastLessons: PastLesson[] = [];
  if (!isInstructor) {
    const completedRows = bookings
      .filter((b) => b.status === "COMPLETED")
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
    const slugCache = new Map<string, string>();
    for (const b of completedRows) {
      const inst = b.instructor;
      if (!inst) continue;
      let s = slugCache.get(inst.id);
      if (!s) {
        s = await ensureInstructorSlug({
          id: inst.id,
          slug: inst.slug,
          businessName: inst.businessName,
          user: { name: inst.user.name },
        });
        slugCache.set(inst.id, s);
      }
      pastLessons.push({
        id: b.id,
        start: new Date(b.start).toISOString(),
        instructorName: inst.businessName || inst.user.name,
        slug: s,
      });
    }
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <BackLink />

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {isInstructor ? "Your diary" : "Your lessons"}
        </h1>

        {!isInstructor && sp.paid && (
          <div className="mt-6 rounded-2xl border border-go/40 bg-go/10 p-4">
            <p className="text-sm font-semibold text-go">
              Payment received — thank you! Your lesson is marked as paid.
            </p>
          </div>
        )}
        {!isInstructor && sp.pay === "cancelled" && (
          <div className="mt-6 rounded-2xl border border-line/50 bg-paper-dim/40 p-4">
            <p className="text-sm font-medium text-ink-soft">
              Payment cancelled — no charge was made. You can pay any time.
            </p>
          </div>
        )}

        {isInstructor && !instructorLocked ? (
          <InstructorDiary lessons={lessons} roster={roster} />
        ) : (
          <div className="mt-9">
            <LessonCalendar
              lessons={lessons}
              isInstructor={isInstructor}
              readOnly={instructorLocked}
            />
          </div>
        )}

        {isInstructor && instructorLocked && (
          <section className="mt-9 rounded-2xl border border-signal/40 bg-signal/10 p-6">
            <p className="font-display text-lg font-semibold text-ink">
              Your subscription has ended
            </p>
            <p className="mt-2 text-[15px] text-ink-soft">
              Your diary is read-only — your upcoming lessons are still shown so
              you don&rsquo;t miss them. Resubscribe to book, edit and manage
              lessons again.
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-dark"
            >
              Resubscribe
            </Link>
          </section>
        )}

        {!isInstructor && (
          <section className="mt-9">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Past lessons
            </h2>
            {pastLessons.length === 0 ? (
              <p className="mt-3 text-[15px] text-ink-soft">
                Your completed lessons will show here.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {pastLessons.map((pl) => (
                  <li
                    key={pl.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">{fmtPast(pl.start)}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        with {pl.instructorName}
                      </p>
                    </div>
                    <Link
                      href={`/instructors/${pl.slug}`}
                      className="shrink-0 rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      View instructor profile &rarr;
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
