import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import { verifyInstructor, rejectInstructor } from "./actions";

export const metadata = { title: "ADI verification" };

type Row = {
  id: string;
  businessName: string | null;
  adiNumber: string;
  postcodes: string;
  transmission: string;
  adiStatus: string;
  adiBadgeUrl: string | null;
  createdAt: string | Date;
  user: { name: string; email: string };
};

function pretty(t: string) {
  return t === "BOTH" ? "Manual & automatic" : t.charAt(0) + t.slice(1).toLowerCase();
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!isAdminEmail(me?.email)) redirect("/dashboard");

  const instructors: Row[] = await prisma.instructorProfile.findMany({
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const pending = instructors.filter((i) => i.adiStatus === "PENDING");
  const reviewed = instructors.filter((i) => i.adiStatus !== "PENDING");

  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      VERIFIED: "bg-go/15 text-go",
      REJECTED: "bg-signal/15 text-signal",
      PENDING: "bg-line/20 text-ink-soft",
    };
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? map.PENDING}`}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </span>
    );
  }

  function InstructorCard({ i }: { i: Row }) {
    return (
      <li className="rounded-2xl border border-hairline bg-cream p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{i.businessName || i.user.name}</p>
              <StatusBadge status={i.adiStatus} />
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {i.user.name} &middot; {i.user.email}
            </p>
            <p className="mt-2 text-sm text-ink">
              ADI badge: <span className="font-semibold">{i.adiNumber}</span>
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {i.postcodes} &middot; {pretty(i.transmission)} &middot; joined{" "}
              {fmtDate(i.createdAt)}
            </p>
            <Link
              href={`/instructors/${i.id}`}
              className="mt-2 inline-block text-sm font-semibold text-sea link-grow"
            >
              View public profile
            </Link>
            {i.adiBadgeUrl ? (
              <a href={`/api/badge/${i.id}`} target="_blank" rel="noopener noreferrer" className="mt-3 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/badge/${i.id}`}
                  alt={`${i.user.name}'s ADI badge`}
                  className="max-h-40 rounded-xl border border-hairline"
                />
                <span className="mt-1 inline-block text-xs font-semibold text-sea">
                  Open full size
                </span>
              </a>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">No badge photo uploaded yet.</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {i.adiStatus !== "VERIFIED" && (
              <form action={verifyInstructor.bind(null, i.id)}>
                <button
                  type="submit"
                  className="rounded-full bg-go px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  Verify
                </button>
              </form>
            )}
            {i.adiStatus !== "REJECTED" && (
              <form action={rejectInstructor.bind(null, i.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal"
                >
                  Reject
                </button>
              </form>
            )}
          </div>
        </div>
      </li>
    );
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
          Admin
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          ADI verification
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Check each instructor&rsquo;s ADI number against the DVSA register (or contact
          DVSA), then verify. Only verified instructors appear in the public directory.
        </p>

        <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
          Awaiting review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="text-[15px] text-ink-soft">Nothing waiting. All caught up.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {pending.map((i) => (
              <InstructorCard key={i.id} i={i} />
            ))}
          </ul>
        )}

        {reviewed.length > 0 && (
          <>
            <h2 className="mt-10 font-display text-2xl font-bold tracking-tight">
              Reviewed
            </h2>
            <ul className="mt-4 space-y-2.5">
              {reviewed.map((i) => (
                <InstructorCard key={i.id} i={i} />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
