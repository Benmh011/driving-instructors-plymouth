import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import Conversation from "@/components/messages/Conversation";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      instructorProfile: true,
      learnerProfile: { include: { activeInstructor: { include: { user: true } } } },
    },
  });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  // ---- Instructor: list of conversations with roster learners ----
  if (user.role === "INSTRUCTOR" && user.instructorProfile) {
    const instructorId = user.instructorProfile.id;

    const roster = await prisma.learnerProfile.findMany({
      where: { activeInstructorId: instructorId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    const msgs: { learnerId: string; body: string; createdAt: Date; senderId: string; readAt: Date | null }[] =
      await prisma.message.findMany({
        where: { instructorId },
        orderBy: { createdAt: "desc" },
        select: { learnerId: true, body: true, createdAt: true, senderId: true, readAt: true },
      });

    const lastByLearner = new Map<string, string>();
    const unreadByLearner = new Map<string, number>();
    for (const m of msgs) {
      if (!lastByLearner.has(m.learnerId)) lastByLearner.set(m.learnerId, m.body);
      if (m.senderId !== user.id && !m.readAt) {
        unreadByLearner.set(m.learnerId, (unreadByLearner.get(m.learnerId) ?? 0) + 1);
      }
    }

    return (
      <div className="relative z-10 min-h-dvh">
        <AppHeader home="/dashboard" right={<SignOutButton />} />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            &larr; Back to dashboard
          </Link>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Messages
          </h1>

          {roster.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
              <p className="text-[15px] text-ink-soft">
                No students yet. Once learners join your roster, you can message them here.
              </p>
            </div>
          ) : (
            <ul className="mt-6 space-y-2.5">
              {roster.map((l: { id: string; user: { name: string } }) => {
                const last = lastByLearner.get(l.id);
                const unread = unreadByLearner.get(l.id) ?? 0;
                return (
                  <li key={l.id}>
                    <Link
                      href={`/messages/${l.id}`}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5 transition-colors hover:border-ink/30"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{l.user.name}</p>
                        <p className="mt-0.5 truncate text-sm text-ink-soft">
                          {last ?? "No messages yet"}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="shrink-0 rounded-full bg-signal px-2.5 py-1 text-xs font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>
    );
  }

  // ---- Learner: a single thread with their active instructor ----
  const learner = user.learnerProfile;
  if (!learner) redirect("/dashboard");

  const inst = learner.activeInstructor;
  if (!learner.activeInstructorId || !inst) {
    return (
      <div className="relative z-10 min-h-dvh">
        <AppHeader home="/dashboard" right={<SignOutButton />} />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
          <h1 className="font-display text-4xl font-bold tracking-tight">Messages</h1>
          <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="text-[15px] text-ink-soft">
              Once you&rsquo;ve joined an instructor, you can message them here.
            </p>
            <Link
              href="/instructors"
              className="mt-2 inline-block text-sm font-semibold text-sea link-grow"
            >
              Find an instructor &rarr;
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const instructorId = learner.activeInstructorId;
  const otherName = inst.businessName || inst.user.name;

  const initial = await prisma.message.findMany({
    where: { instructorId, learnerId: learner.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, body: true, createdAt: true },
  });

  await prisma.message.updateMany({
    where: { instructorId, learnerId: learner.id, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{otherName}</h1>
        <div className="mt-5">
          <Conversation
            instructorId={instructorId}
            learnerId={learner.id}
            meId={user.id}
            otherName={otherName}
            initial={initial.map((m: { id: string; senderId: string; body: string; createdAt: Date }) => ({
              id: m.id,
              senderId: m.senderId,
              body: m.body,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        </div>
      </main>
    </div>
  );
}
