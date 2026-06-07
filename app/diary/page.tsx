import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BookLessonForm from "@/components/diary/BookLessonForm";
import CancelButton from "@/components/diary/CancelButton";

export const metadata = { title: "Diary" };

type Row = {
  id: string;
  start: string | Date;
  durationMins: number;
  status: string;
  learner?: { user: { name: string } };
  instructor?: {
    user: { name: string };
    businessName: string | null;
    cancellationNoticeHours: number;
  };
};

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

function fmtLength(m: number) {
  if (m % 60 === 0) return `${m / 60} hr${m === 60 ? "" : "s"}`;
  return `${m} min`;
}

export default async function DiaryPage() {
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
  const now = new Date();

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

  const upcoming = bookings.filter(
    (b) => b.status === "BOOKED" && new Date(b.start) >= now,
  );
  const past = bookings
    .filter((b) => !(b.status === "BOOKED" && new Date(b.start) >= now))
    .reverse();

  const ownNotice = user.instructorProfile?.cancellationNoticeHours ?? 48;

  const rosterRaw: { id: string; user: { name: string } }[] =
    user.instructorProfile?.roster ?? [];
  const roster = rosterRaw.map((r) => ({ id: r.id, name: r.user.name }));

  function otherParty(b: Row) {
    if (isInstructor) return b.learner?.user.name ?? "Student";
    return b.instructor?.businessName || b.instructor?.user.name || "Instructor";
  }

  function LessonRow({ b, cancellable }: { b: Row; cancellable: boolean }) {
    const noticeHours = isInstructor
      ? ownNotice
      : b.instructor?.cancellationNoticeHours ?? 48;
    const hoursUntil = (new Date(b.start).getTime() - now.getTime()) / 3_600_000;
    const late = hoursUntil < noticeHours;
    const confirmText = late
      ? `This lesson is inside the ${noticeHours}-hour notice window. Cancel it anyway?`
      : "Cancel this lesson?";

    return (
      <li className="flex items-center justify-between gap-4 bg-paper p-5">
        <div>
          <p className="font-semibold">{fmtWhen(b.start)}</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            {fmtLength(b.durationMins)} &middot; {otherParty(b)}
            {b.status === "CANCELLED" && " · cancelled"}
          </p>
        </div>
        {cancellable && <CancelButton id={b.id} confirmText={confirmText} />}
      </li>
    );
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {isInstructor ? "Your diary" : "Your lessons"}
        </h1>

        {/* Instructor: book a lesson */}
        {isInstructor && (
          <section className="mt-9 rounded-2xl border border-hairline bg-paper p-6">
            <p className="font-display text-lg font-semibold">Book a lesson</p>
            {roster.length === 0 ? (
              <p className="mt-2 text-[15px] text-ink-soft">
                You&rsquo;ll be able to book lessons once you have students.{" "}
                <Link href="/students" className="font-semibold text-sea link-grow">
                  Add students
                </Link>{" "}
                with your invite link first.
              </p>
            ) : (
              <div className="mt-4">
                <BookLessonForm roster={roster} />
              </div>
            )}
          </section>
        )}

        {/* Upcoming */}
        <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="text-[15px] text-ink-soft">No upcoming lessons.</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline">
            {upcoming.map((b) => (
              <LessonRow key={b.id} b={b} cancellable />
            ))}
          </ul>
        )}

        {/* Past / cancelled */}
        {past.length > 0 && (
          <>
            <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
              Earlier
            </h2>
            <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline">
              {past.map((b) => (
                <LessonRow key={b.id} b={b} cancellable={false} />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
