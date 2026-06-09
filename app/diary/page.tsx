import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import SignOutButton from "@/components/auth/SignOutButton";
import BookLessonForm from "@/components/diary/BookLessonForm";
import LessonCalendar, { type CalLesson } from "@/components/diary/LessonCalendar";

export const metadata = { title: "Diary" };

type Row = {
  id: string;
  start: string | Date;
  durationMins: number;
  status: string;
  notes: string | null;
  learner?: { user: { name: string } };
  instructor?: {
    user: { name: string };
    businessName: string | null;
    cancellationNoticeHours: number;
  };
};

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
  }));

  const rosterRaw: { id: string; user: { name: string } }[] =
    user.instructorProfile?.roster ?? [];
  const roster = rosterRaw.map((r) => ({ id: r.id, name: r.user.name }));

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

        <div className="mt-9">
          <LessonCalendar lessons={lessons} isInstructor={isInstructor} />
        </div>

        {isInstructor && (
          <section className="mt-9 rounded-2xl border border-hairline bg-cream p-6">
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
      </main>
      <BottomNav />
    </div>
  );
}
