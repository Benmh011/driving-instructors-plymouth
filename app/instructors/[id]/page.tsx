import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import { MAX_ROSTER } from "@/lib/constants";
import { ensureInstructorSlug } from "@/lib/slug";
import { formatCar } from "@/lib/car";
import { accessState, hasFullAccess } from "@/lib/subscription";
import BackLink from "@/components/BackLink";
import { Stars } from "@/components/reviews/Stars";
import { Avatar } from "@/components/profile/Avatar";
import { instructorPhotoSrc } from "@/lib/photo";
import ReviewForm from "@/components/reviews/ReviewForm";
import {
  createJoinRequest,
  withdrawJoinRequest,
  deleteReview,
  removeReviewAsAdmin,
} from "../actions";
import { isAdminEmail } from "@/lib/admin";

function pretty(t: string) {
  return t === "BOTH" ? "Manual & automatic" : t.charAt(0) + t.slice(1).toLowerCase();
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function firstName(name: string) {
  return name.split(" ")[0] || name;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: param } = await params;
  const i = await prisma.instructorProfile.findFirst({
    where: { OR: [{ slug: param }, { id: param }] },
    select: {
      businessName: true,
      postcodes: true,
      transmission: true,
      user: { select: { name: true } },
    },
  });
  if (!i) return { title: "Instructor" };
  const nm = i.businessName || i.user.name;
  return {
    title: `${nm} — Driving Instructor in Plymouth`,
    description: `Book driving lessons with ${nm}, covering ${i.postcodes}. ${pretty(
      i.transmission,
    )} tuition. Compare and request lessons on Driving Instructors Plymouth.`,
  };
}

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: param } = await params;

  const instructor = await prisma.instructorProfile.findFirst({
    where: { OR: [{ slug: param }, { id: param }] },
    include: {
      user: true,
      _count: { select: { roster: true } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { learner: { include: { user: { select: { name: true } } } } },
      },
    },
  });
  if (!instructor) notFound();

  // An account scheduled for deletion disappears from public view immediately.
  if (instructor.user.deletionScheduledFor) notFound();
  // A closed (anonymised) account stays gone for good.
  if (instructor.user.anonymizedAt) notFound();

  // Canonicalise to the slug URL (older /instructors/<id> links 308 to the slug).
  const slug = await ensureInstructorSlug(instructor);
  if (param !== slug) redirect(`/instructors/${slug}`);

  const reviews = instructor.reviews;
  const reviewCount = reviews.length;
  const avgRating =
    reviewCount > 0
      ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviewCount
      : 0;

  const session = await auth();
  const isAdmin = isAdminEmail(session?.user?.email);

  // Locked instructors vanish from public view entirely — no "not taking
  // students" messaging to learners. The owner gets a private heads-up instead.
  const profileLocked = !hasFullAccess(accessState(instructor));
  const isOwner = !!session?.user?.id && session.user.id === instructor.userId;
  if (profileLocked && !isOwner) notFound();
  if (profileLocked && isOwner) {
    return (
      <div className="relative z-10 min-h-dvh">
        <AppHeader home="/dashboard" right={<SignOutButton />} />
        <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
          <BackLink href="/dashboard/profile" label="Profile" />
          <section className="mt-8 rounded-2xl border border-signal/40 bg-signal/10 p-6">
            <h1 className="font-display text-2xl font-bold text-ink">
              Your public profile is hidden
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">
              While your subscription is paused, your profile doesn&rsquo;t appear
              in search and learners can&rsquo;t view it or request lessons. It
              reappears automatically the moment you resubscribe.
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-dark"
            >
              Resubscribe
            </Link>
          </section>
        </main>
      </div>
    );
  }

  let viewer:
    | {
        role: string;
        learnerProfile: { id: string; activeInstructorId: string | null } | null;
        instructorProfile: { id: string } | null;
      }
    | null = null;
  let existingStatus: string | null = null;
  let canReview = false;
  let myReview: { rating: number; body: string | null } | null = null;

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

      const booked = await prisma.booking.findFirst({
        where: {
          instructorId: instructor.id,
          learnerId: viewer.learnerProfile.id,
          status: "COMPLETED",
          paid: true,
        },
        select: { id: true },
      });
      canReview = !!booked;
      myReview = await prisma.review.findUnique({
        where: {
          instructorId_learnerId: {
            instructorId: instructor.id,
            learnerId: viewer.learnerProfile.id,
          },
        },
        select: { rating: true, body: true },
      });
    }
  }

  const full =
    !instructor.acceptingStudents || instructor._count.roster >= MAX_ROSTER;
  const name = instructor.businessName || instructor.user.name;
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
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
      <AppHeader home={isOwner ? "/dashboard" : "/"} right={right} />

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Link
          href={isOwner ? "/dashboard/profile" : "/instructors"}
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; {isOwner ? "Back to your profile" : "All instructors"}
        </Link>

        <section className="mt-4 overflow-hidden rounded-3xl bg-tarmac text-cream">
          <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:gap-6 sm:p-9">
            <Avatar
              photoSrc={instructorPhotoSrc(instructor.id, instructor.photoUrl)}
              initials={initials}
              className="h-20 w-20 rounded-2xl"
              textClassName="text-3xl"
              tone="onDark"
            />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                {name}
              </h1>
              <p className="mt-2 text-cream/70">
                {instructor.postcodes} &middot; {pretty(instructor.transmission)}
              </p>
              {reviewCount > 0 && (
                <p className="mt-2 flex items-center gap-1.5 text-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-line" fill="currentColor" aria-hidden>
                    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 21.5l1.2-6.5L2.5 9.4l6.6-.9z" />
                  </svg>
                  <span className="font-semibold text-cream">{avgRating.toFixed(1)}</span>
                  <span className="text-cream/60">
                    ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                  </span>
                </p>
              )}
            </div>
            <span
              className={`shrink-0 self-start rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                full ? "bg-white/10 text-cream/70" : "bg-go text-white"
              }`}
            >
              {full ? "Books full" : "Taking students"}
            </span>
          </div>
        </section>

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
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

        {(formatCar(instructor) || instructor.carDetails) && (
          <p className="mt-4 text-[15px] text-ink-soft">
            Tuition car:{" "}
            <span className="font-semibold text-ink">
              {[formatCar(instructor), instructor.carDetails]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          <RequestPanel />
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Reviews</h2>

          {canReview && (
            <div className="mt-4 rounded-2xl border border-hairline bg-cream p-6">
              <p className="font-display text-lg font-semibold">
                {myReview ? "Your review" : `Leave a review for ${name}`}
              </p>
              <div className="mt-3">
                <ReviewForm
                  instructorId={instructorId}
                  initialRating={myReview?.rating ?? 0}
                  initialBody={myReview?.body ?? ""}
                />
              </div>
              {myReview && (
                <form
                  action={deleteReview.bind(null, instructorId)}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className="text-sm font-medium text-signal hover:underline"
                  >
                    Remove my review
                  </button>
                </form>
              )}
            </div>
          )}

          {reviewCount === 0 ? (
            <p className="mt-4 text-[15px] text-ink-soft">
              No reviews yet{canReview ? " — be the first to leave one." : "."}
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {reviews.map(
                (r: {
                  id: string;
                  rating: number;
                  body: string | null;
                  createdAt: string | Date;
                  learner: { user: { name: string } };
                }) => (
                  <li key={r.id} className="rounded-2xl border border-hairline bg-cream p-5">
                    <div className="flex items-center justify-between gap-3">
                      <Stars value={r.rating} />
                      <span className="text-sm text-ink-soft">{fmtDate(r.createdAt)}</span>
                    </div>
                    {r.body && <p className="mt-2 text-[15px] text-ink">{r.body}</p>}
                    <p className="mt-2 text-sm font-medium text-ink-soft">
                      {firstName(r.learner.user.name)}
                    </p>
                    {isAdmin && (
                      <form
                        action={removeReviewAsAdmin.bind(null, r.id)}
                        className="mt-2"
                      >
                        <button
                          type="submit"
                          className="text-xs font-medium text-signal hover:underline"
                        >
                          Remove (admin)
                        </button>
                      </form>
                    )}
                  </li>
                ),
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
