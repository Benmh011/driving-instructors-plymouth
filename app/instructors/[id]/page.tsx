import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import SignOutButton from "@/components/auth/SignOutButton";
import { MAX_ROSTER } from "@/lib/constants";
import { createJoinRequest, withdrawJoinRequest } from "../actions";

function pretty(t: string) {
  return t === "BOTH" ? "Manual & automatic" : t.charAt(0) + t.slice(1).toLowerCase();
}

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const instructor = await prisma.instructorProfile.findUnique({
    where: { id },
    include: { user: true, _count: { select: { roster: true } } },
  });
  if (!instructor) notFound();

  const session = await auth();
  let viewer:
    | {
        role: string;
        learnerProfile: { id: string; activeInstructorId: string | null } | null;
        instructorProfile: { id: string } | null;
      }
    | null = null;
  let existingStatus: string | null = null;

  if (session?.user?.id) {
    viewer = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        learnerProfile: { select: { id: true, activeInstructorId: true } },
        instructorProfile: { select: { id: true } },
      },
    });
    if (viewer?.learnerProfile) {
      const req = await prisma.joinRequest.findUnique({
        where: {
          instructorId_learnerId: {
            instructorId: instructor.id,
            learnerId: viewer.learnerProfile.id,
          },
        },
      });
      existingStatus = req?.status ?? null;
    }
  }

  const full =
    !instructor.acceptingStudents || instructor._count.roster >= MAX_ROSTER;
  const name = instructor.businessName || instructor.user.name;
  const instructorId: string = instructor.id;
  const verified = instructor.adiStatus === "VERIFIED";

  const learner = viewer?.learnerProfile ?? null;
  const isOwnProfile = viewer?.instructorProfile?.id === instructor.id;
  const isInstructorViewer = viewer?.role === "INSTRUCTOR";
  const alreadyWithThis = learner?.activeInstructorId === instructor.id;
  const withOther =
    !!learner?.activeInstructorId && learner.activeInstructorId !== instructor.id;

  const right = session ? (
    <SignOutButton />
  ) : (
    <Link
      href="/login"
      className="rounded-full border border-paper/25 px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper hover:text-tarmac"
    >
      Log in
    </Link>
  );

  function RequestPanel() {
    if (isOwnProfile) {
      return (
        <p className="text-[15px] text-ink-soft">
          This is how learners see your public profile.
        </p>
      );
    }
    if (isInstructorViewer) {
      return (
        <p className="text-[15px] text-ink-soft">
          You&rsquo;re signed in as an instructor.
        </p>
      );
    }
    if (!verified) {
      return (
        <p className="text-[15px] text-ink-soft">
          This instructor isn&rsquo;t taking new requests through the marketplace yet.
        </p>
      );
    }
    if (!session) {
      return (
        <>
          <p className="mb-3 text-[15px] text-ink-soft">
            {full
              ? `${name} is at capacity, but you can join the waitlist.`
              : `Log in as a learner to request lessons with ${name}.`}
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark"
          >
            Log in to request
          </Link>
        </>
      );
    }
    if (!learner) {
      return (
        <p className="text-[15px] text-ink-soft">
          Only learner accounts can request lessons.
        </p>
      );
    }
    if (alreadyWithThis) {
      return (
        <p className="text-[15px] font-medium text-ink">
          You&rsquo;re already learning with {name}.{" "}
          <Link href="/diary" className="font-semibold text-sea link-grow">
            View your diary
          </Link>
        </p>
      );
    }
    if (withOther) {
      return (
        <p className="text-[15px] text-ink-soft">
          You&rsquo;re currently learning with another instructor. Switching from
          inside the app is coming soon.
        </p>
      );
    }
    if (existingStatus === "PENDING") {
      return (
        <div>
          <p className="mb-3 text-[15px] font-medium text-ink">
            Request sent &mdash; waiting for {name} to respond.
          </p>
          <form action={withdrawJoinRequest.bind(null, instructorId)}>
            <button
              type="submit"
              className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal"
            >
              Withdraw request
            </button>
          </form>
        </div>
      );
    }
    // No active request (or previously declined) → show the request form.
    return (
      <form action={createJoinRequest.bind(null, instructorId)} className="space-y-3">
        {existingStatus === "DECLINED" && (
          <p className="text-[15px] text-ink-soft">
            Your previous request wasn&rsquo;t accepted, but you can ask again.
          </p>
        )}
        <textarea
          name="message"
          rows={3}
          placeholder={`Optional: a quick note to ${name} (your goal, rough availability)…`}
          className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink"
        />
        <button
          type="submit"
          className="rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark"
        >
          {full ? "Join the waitlist" : "Request to join"}
        </button>
        {full && (
          <p className="text-sm text-ink-soft">
            {name} is at capacity right now &mdash; they&rsquo;ll be in touch if a space
            opens up.
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/" right={right} />

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Link
          href="/instructors"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; All instructors
        </Link>

        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {name}
            </h1>
            <p className="mt-2 text-ink-soft">
              {instructor.postcodes} &middot; {pretty(instructor.transmission)}
            </p>
          </div>
          <span
            className={`mt-2 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              full ? "bg-ink/10 text-ink-soft" : "bg-go/15 text-go"
            }`}
          >
            {full ? "Books full" : "Taking students"}
          </span>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          <div className="bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Hourly rate
            </p>
            <p className="mt-1 font-medium">£{instructor.hourlyRate}/hr</p>
          </div>
          <div className="bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Gearbox
            </p>
            <p className="mt-1 font-medium">{pretty(instructor.transmission)}</p>
          </div>
          <div className="bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              ADI badge
            </p>
            <p className={`mt-1 font-medium ${verified ? "text-go" : "text-ink-soft"}`}>
              {verified ? "DVSA approved" : "Awaiting verification"}
            </p>
          </div>
        </div>

        {instructor.bio && (
          <div className="mt-6">
            <h2 className="font-display text-xl font-semibold">About</h2>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {instructor.bio}
            </p>
          </div>
        )}

        {instructor.carDetails && (
          <p className="mt-4 text-[15px] text-ink-soft">
            Tuition car: {instructor.carDetails}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          <RequestPanel />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
