import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";

export const metadata = { title: "Student" };

function pretty(t: string) {
  return t === "BOTH" ? "Either" : t.charAt(0) + t.slice(1).toLowerCase();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

type Lesson = {
  id: string;
  start: Date;
  durationMins: number;
  status: string;
  paid: boolean;
  pricePence: number | null;
};

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instructorProfile: { select: { id: true } } },
  });
  if (!me || me.role !== "INSTRUCTOR" || !me.instructorProfile) redirect("/dashboard");
  const ip = me.instructorProfile;

  const learner = await prisma.learnerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      bookings: {
        where: { instructorId: ip.id },
        orderBy: { start: "desc" },
      },
    },
  });

  // Only a learner's current instructor may view their detail.
  if (!learner || learner.activeInstructorId !== ip.id) redirect("/students");

  const name = learner.user.name;
  const bookings = learner.bookings;
  const now = new Date();
  const upcoming = bookings.filter(
    (b: Lesson) => b.status === "BOOKED" && b.start >= now,
  ).length;
  const completed = bookings.filter(
    (b: Lesson) => b.status === "COMPLETED",
  ).length;

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink />

        <div className="mt-4 flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-tarmac/10 text-xl font-bold text-tarmac">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {name}
            </h1>
            <p className="mt-1 text-ink-soft">
              {learner.postcode} &middot; {pretty(learner.transmission)}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Upcoming lessons" value={String(upcoming)} />
          <Stat label="Completed" value={String(completed)} />
          <Stat label="With you since" value={dateFmt.format(learner.createdAt)} />
        </div>

        {learner.goal && (
          <div className="mt-5 rounded-2xl border border-hairline bg-cream p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Goal
            </p>
            <p className="mt-1 text-[15px] text-ink">{learner.goal}</p>
          </div>
        )}

        <h2 className="mt-9 font-display text-2xl font-bold tracking-tight">Lessons</h2>
        {bookings.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-5 text-[15px] text-ink-soft">
            No lessons booked with this learner yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {bookings.map((b: Lesson) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {dateFmt.format(b.start)} &middot; {timeFmt.format(b.start)}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {b.durationMins} min
                    {b.pricePence ? ` · £${(b.pricePence / 100).toFixed(2)}` : ""}
                  </p>
                </div>
                <StatusChip status={b.status} paid={b.paid} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-cream p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-ink">{value}</p>
    </div>
  );
}

function StatusChip({ status, paid }: { status: string; paid: boolean }) {
  const tone: Record<string, string> = {
    BOOKED: "bg-sea/15 text-sea-dark",
    COMPLETED: "bg-go/15 text-go",
    CANCELLED: "bg-signal/15 text-signal",
  };
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status] ?? "bg-ink/10 text-ink-soft"}`}
      >
        {label}
      </span>
      {status !== "CANCELLED" && (
        <span className={`text-xs font-medium ${paid ? "text-go" : "text-ink-soft"}`}>
          {paid ? "Paid" : "Unpaid"}
        </span>
      )}
    </div>
  );
}
