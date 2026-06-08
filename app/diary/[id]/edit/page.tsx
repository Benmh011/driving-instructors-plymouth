import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import EditLessonForm from "@/components/diary/EditLessonForm";

export const metadata = { title: "Edit lesson" };

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

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/dashboard");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { learner: { include: { user: true } } },
  });
  if (!booking || booking.instructorId !== instructor.id) redirect("/diary");
  if (booking.status === "CANCELLED") redirect("/diary");

  const defaultStart = new Date(booking.start).toISOString().slice(0, 16);
  const studentName = booking.learner?.user?.name ?? "your student";

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <Link
          href="/diary"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to diary
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Edit lesson
        </h1>
        <p className="mt-2 text-ink-soft">
          With {studentName} — currently {fmtWhen(booking.start)}.
        </p>

        <div className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          <EditLessonForm
            id={booking.id}
            defaultStart={defaultStart}
            defaultDuration={booking.durationMins}
            defaultPrice={(booking.pricePence ?? 0) / 100}
            defaultNotes={booking.notes ?? ""}
          />
        </div>
      </main>
    </div>
  );
}
