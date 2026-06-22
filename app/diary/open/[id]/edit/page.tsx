import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import EditOpenLessonForm from "@/components/diary/EditOpenLessonForm";

export const metadata = { title: "Edit open slot" };

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

export default async function EditOpenLessonPage({
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

  const open = await prisma.openLesson.findUnique({ where: { id } });
  if (!open || open.instructorId !== instructor.id) redirect("/diary");

  const defaultStart = new Date(open.start).toISOString().slice(0, 16);

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
          Edit open slot
        </h1>
        <p className="mt-2 text-ink-soft">
          An unclaimed slot — currently {fmtWhen(open.start)}.
        </p>

        <div className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          <EditOpenLessonForm
            id={open.id}
            defaultStart={defaultStart}
            defaultDuration={open.durationMins}
            defaultPrice={(open.pricePence ?? 0) / 100}
            defaultNotes={open.notes ?? ""}
          />
        </div>
      </main>
    </div>
  );
}
