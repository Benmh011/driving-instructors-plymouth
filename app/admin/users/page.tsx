import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";

export const metadata = { title: "All users" };
export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

type Row = {
  id: string;
  name: string;
  email: string;
  role: string;
  onboardingComplete: boolean;
  createdAt: Date;
  anonymizedAt: Date | null;
  learnerProfile: { activeInstructorId: string | null } | null;
  instructorProfile: {
    adiStatus: string;
    phone: string | null;
    adiBadgeUrl: string | null;
    photoUrl: string | null;
    inviteCode: string | null;
    stripeSubscriptionId: string | null;
    updatedAt: Date;
    _count: { roster: number; bookings: number };
  } | null;
};

function Signal({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={done ? "font-medium text-go" : "text-ink-soft"}>
      {done ? "✓" : "○"} {label}
    </li>
  );
}

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!isAdminEmail(me?.email)) redirect("/dashboard");

  const users: Row[] = await prisma.user.findMany({
    where: { anonymizedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      onboardingComplete: true,
      createdAt: true,
      anonymizedAt: true,
      learnerProfile: { select: { activeInstructorId: true } },
      instructorProfile: {
        select: {
          adiStatus: true,
          phone: true,
          adiBadgeUrl: true,
          photoUrl: true,
          inviteCode: true,
          stripeSubscriptionId: true,
          updatedAt: true,
          _count: { select: { roster: true, bookings: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const learners = users.filter((u) => u.role === "LEARNER").length;
  const instructors = users.filter((u) => u.role === "INSTRUCTOR").length;

  function status(u: Row): string {
    if (!u.onboardingComplete) return "Signed up (not onboarded)";
    if (u.role === "INSTRUCTOR") {
      const s = u.instructorProfile?.adiStatus ?? "—";
      return `Instructor · ADI ${s.toLowerCase()}`;
    }
    if (u.role === "LEARNER") {
      return u.learnerProfile?.activeInstructorId
        ? "Learner · has instructor"
        : "Learner · waiting";
    }
    return u.role;
  }

  return (
    <div className="min-h-dvh bg-cream">
      <AppHeader right={<SignOutButton />} />
      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        <BackLink href="/admin" label="Back to admin" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">All users</h1>
        <p className="mt-1 text-ink-soft">
          {users.length} total · {learners} learners · {instructors} instructors
        </p>

        <ul className="mt-6 space-y-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="rounded-2xl border border-hairline bg-paper p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-ink">{u.name}</p>
                <p className="text-sm text-ink-soft">joined {fmt(u.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                <a
                  href={`mailto:${u.email}`}
                  className="underline decoration-ink/30 underline-offset-2 hover:text-ink"
                >
                  {u.email}
                </a>
                {u.instructorProfile?.phone && (
                  <>
                    {" · "}
                    <a
                      href={`tel:${u.instructorProfile.phone.replace(/\s/g, "")}`}
                      className="font-semibold text-sea"
                    >
                      {u.instructorProfile.phone}
                    </a>
                  </>
                )}
              </p>
              <p className="mt-2 inline-block rounded-full bg-cream px-3 py-1 text-xs font-semibold text-ink-soft">
                {status(u)}
              </p>

              {u.instructorProfile && (
                <div className="mt-3 border-t border-hairline pt-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-soft">
                    Activity
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <Signal
                      done={!!u.instructorProfile.adiBadgeUrl}
                      label="ADI badge uploaded"
                    />
                    <Signal
                      done={!!u.instructorProfile.photoUrl}
                      label="Profile photo"
                    />
                    <Signal
                      done={!!u.instructorProfile.stripeSubscriptionId}
                      label="Started billing"
                    />
                    <Signal
                      done={!!u.instructorProfile.inviteCode}
                      label="Opened Students page"
                    />
                    <Signal
                      done={u.instructorProfile._count.roster > 0}
                      label={`${u.instructorProfile._count.roster} students`}
                    />
                    <Signal
                      done={u.instructorProfile._count.bookings > 0}
                      label={`${u.instructorProfile._count.bookings} lessons`}
                    />
                  </ul>
                  <p className="mt-2 text-xs text-ink-soft">
                    Profile last changed {fmt(u.instructorProfile.updatedAt)}
                  </p>
                </div>
              )}
            </li>
          ))}
          {users.length === 0 && (
            <li className="rounded-2xl border border-hairline bg-paper p-5 text-[15px] text-ink-soft">
              No users yet.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}
