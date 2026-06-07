import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import InviteLink from "@/components/students/InviteLink";
import { generateInviteCode } from "@/lib/inviteCode";
import { SITE_URL, MAX_ROSTER } from "@/lib/constants";
import { toggleAccepting, acceptJoinRequest, declineJoinRequest } from "./actions";

export const metadata = { title: "Your students" };

function pretty(t: string) {
  return t === "BOTH" ? "Either" : t.charAt(0) + t.slice(1).toLowerCase();
}

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      instructorProfile: {
        include: {
          roster: { include: { user: true }, orderBy: { createdAt: "asc" } },
          joinRequests: {
            where: { status: "PENDING" },
            include: { learner: { include: { user: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
  if (!user) redirect("/login");
  if (user.role !== "INSTRUCTOR" || !user.instructorProfile) redirect("/dashboard");

  const i = user.instructorProfile;

  // Mint an invite code the first time an instructor opens this page.
  let code = i.inviteCode;
  if (!code) {
    code = generateInviteCode();
    await prisma.instructorProfile.update({
      where: { id: i.id },
      data: { inviteCode: code },
    });
  }

  const link = `${SITE_URL}/join/${code}`;
  const roster: {
    id: string;
    postcode: string;
    transmission: string;
    goal: string | null;
    user: { name: string };
  }[] = i.roster ?? [];

  const requests: {
    id: string;
    message: string | null;
    learner: { postcode: string; transmission: string; user: { name: string } };
  }[] = i.joinRequests ?? [];

  const full = roster.length >= MAX_ROSTER;

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
          Your students
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Share your invite link with the learners you already teach and they&rsquo;ll
          appear here. Each learner can be with one instructor at a time.
        </p>

        {/* Invite link */}
        <section className="mt-9 rounded-2xl border border-hairline bg-cream p-6">
          <p className="font-display text-lg font-semibold">Your invite link</p>
          <p className="mt-1 mb-4 text-[15px] text-ink-soft">
            Anyone who opens this and signs up as a learner joins your list straight away.
          </p>
          <InviteLink url={link} />
        </section>

        {/* Availability */}
        <section className="mt-5 flex flex-col gap-4 rounded-2xl border border-hairline bg-cream p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold">Taking new students</p>
            <p className="mt-1 text-[15px] text-ink-soft">
              {i.acceptingStudents
                ? "New learners can request to join you from the marketplace."
                : "You're hidden from new marketplace requests. Your invite link still works."}
            </p>
          </div>
          <form action={toggleAccepting}>
            <button
              type="submit"
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                i.acceptingStudents
                  ? "bg-go text-white hover:opacity-90"
                  : "border border-ink/20 text-ink hover:border-ink"
              }`}
            >
              {i.acceptingStudents ? "On" : "Off"}
            </button>
          </form>
        </section>

        {/* Pending requests */}
        {requests.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Requests to join
            </h2>
            {full && (
              <p className="mt-2 text-[15px] font-medium text-signal">
                You&rsquo;re at your roster cap ({MAX_ROSTER}). Free up a space before
                accepting.
              </p>
            )}
            <ul className="mt-4 space-y-2.5">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-hairline bg-cream p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">{r.learner.user.name}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {r.learner.postcode} &middot; {pretty(r.learner.transmission)}
                      </p>
                      {r.message && (
                        <p className="mt-2 text-sm text-ink">&ldquo;{r.message}&rdquo;</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <form action={acceptJoinRequest.bind(null, r.id)}>
                        <button
                          type="submit"
                          disabled={full}
                          className="rounded-full bg-go px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Accept
                        </button>
                      </form>
                      <form action={declineJoinRequest.bind(null, r.id)}>
                        <button
                          type="submit"
                          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal"
                        >
                          Decline
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Roster */}
        <div className="mt-10 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            On your list
          </h2>
          <span className="text-sm font-semibold text-ink-soft">
            {roster.length} / {MAX_ROSTER}
          </span>
        </div>

        {roster.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="text-[15px] text-ink-soft">
              No students yet. Share your invite link above to add the learners you
              already teach.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
            {roster.map((learner) => (
              <li key={learner.id} className="bg-cream p-5">
                <p className="font-semibold">{learner.user.name}</p>
                <p className="mt-1 text-sm text-ink-soft">
                  {learner.postcode} &middot; {pretty(learner.transmission)}
                  {learner.goal ? ` · ${learner.goal}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
