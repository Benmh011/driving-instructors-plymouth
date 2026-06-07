import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import { joinInstructor } from "./actions";

export const metadata = { title: "Join your instructor" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader />
      <main className="mx-auto grid max-w-md place-items-center px-5 py-16">
        <div className="w-full rounded-2xl border border-hairline bg-paper p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

const primaryBtn =
  "inline-flex w-full items-center justify-center rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark";
const ghostBtn =
  "inline-flex w-full items-center justify-center rounded-full border border-ink/20 px-6 py-3 font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper";

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ full?: string }>;
}) {
  const { code } = await params;
  const { full } = await searchParams;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { inviteCode: code },
    include: { user: true },
  });

  if (!instructor) {
    return (
      <Shell>
        <p className="font-display text-2xl font-bold">Link not found</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          This invite link doesn&rsquo;t match an instructor. Double-check it with whoever
          sent it to you.
        </p>
        <Link href="/" className={`mt-6 ${ghostBtn}`}>
          Go to homepage
        </Link>
      </Shell>
    );
  }

  const name = instructor.businessName || instructor.user.name;
  const session = await auth();

  // List is full.
  if (full) {
    return (
      <Shell>
        <p className="font-display text-2xl font-bold">{name}&rsquo;s list is full</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          They&rsquo;ve reached their student limit right now. Ask them directly, or find
          another instructor once the directory&rsquo;s live.
        </p>
        <Link href="/dashboard" className={`mt-6 ${ghostBtn}`}>
          Back to dashboard
        </Link>
      </Shell>
    );
  }

  // Not logged in.
  if (!session?.user?.id) {
    return (
      <Shell>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
          Invitation
        </p>
        <p className="mt-2 font-display text-2xl font-bold">
          Join {name}&rsquo;s student list
        </p>
        <p className="mt-2 text-[15px] text-ink-soft">
          Create a free learner account (or log in), then re-open this link to join.
        </p>
        <div className="mt-6 space-y-2.5">
          <Link href="/register" className={primaryBtn}>
            Create a learner account
          </Link>
          <Link href="/login" className={ghostBtn}>
            I already have an account
          </Link>
        </div>
      </Shell>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true },
  });

  // Logged in as an instructor.
  if (!user || user.role !== "LEARNER") {
    return (
      <Shell>
        <p className="font-display text-2xl font-bold">This is a learner invite</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          You&rsquo;re signed in as an instructor, so there&rsquo;s nothing to join here.
        </p>
        <Link href="/dashboard" className={`mt-6 ${ghostBtn}`}>
          Back to dashboard
        </Link>
      </Shell>
    );
  }

  // Learner hasn't finished setup.
  if (!user.onboardingComplete || !user.learnerProfile) {
    return (
      <Shell>
        <p className="font-display text-2xl font-bold">Finish your setup first</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          Complete your learner profile, then re-open this link to join {name}.
        </p>
        <Link href="/onboarding" className={`mt-6 ${primaryBtn}`}>
          Finish setup
        </Link>
      </Shell>
    );
  }

  const activeId = user.learnerProfile.activeInstructorId;

  // Already on this instructor's list.
  if (activeId === instructor.id) {
    return (
      <Shell>
        <p className="font-display text-2xl font-bold">You&rsquo;re already with {name}</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          You&rsquo;re on their student list — nothing more to do here.
        </p>
        <Link href="/dashboard" className={`mt-6 ${ghostBtn}`}>
          Back to dashboard
        </Link>
      </Shell>
    );
  }

  // Already with a different instructor — this is a switch.
  let currentName: string | null = null;
  if (activeId) {
    const current = await prisma.instructorProfile.findUnique({
      where: { id: activeId },
      include: { user: true },
    });
    if (current) currentName = current.businessName || current.user.name;
  }

  return (
    <Shell>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
        Invitation
      </p>
      <p className="mt-2 font-display text-2xl font-bold">
        Join {name}&rsquo;s student list
      </p>
      {currentName ? (
        <p className="mt-2 text-[15px] text-ink-soft">
          You&rsquo;re currently registered with <strong>{currentName}</strong>. Joining{" "}
          {name} will move you to their list.
        </p>
      ) : (
        <p className="mt-2 text-[15px] text-ink-soft">
          You&rsquo;ll be added to their list and they&rsquo;ll be able to book your lessons.
        </p>
      )}
      <form action={joinInstructor.bind(null, code)} className="mt-6">
        <button type="submit" className={primaryBtn}>
          {currentName ? `Move to ${name}` : `Join ${name}`}
        </button>
      </form>
    </Shell>
  );
}
