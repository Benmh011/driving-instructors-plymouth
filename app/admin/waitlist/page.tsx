import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";

export const metadata = { title: "Learner waitlist" };

type Row = {
  id: string;
  postcode: string;
  transmission: string;
  goal: string | null;
  createdAt: Date;
  user: { name: string; email: string };
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function WaitlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!isAdminEmail(me?.email)) redirect("/dashboard");

  // The waitlist is simply every learner without an active instructor —
  // exactly who to hand to the next instructor that signs up in their area.
  const waiting: Row[] = await prisma.learnerProfile.findMany({
    where: { activeInstructorId: null, user: { deletedAt: null } },
    select: {
      id: true,
      postcode: true,
      transmission: true,
      goal: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-dvh bg-cream">
      <AppHeader right={<SignOutButton />} />
      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        <BackLink href="/account" label="Back to account" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">
          Learner waitlist
        </h1>
        <p className="mt-1 text-ink-soft">
          Learners signed up and waiting for an instructor — {waiting.length}{" "}
          waiting. These are the leads to hand to new instructors in their
          area.
        </p>

        <ul className="mt-6 space-y-3">
          {waiting.map((l) => (
            <li
              key={l.id}
              className="rounded-2xl border border-hairline bg-paper p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-ink">{l.user.name}</p>
                <p className="text-sm text-ink-soft">joined {fmt(l.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-ink-soft">
                {l.postcode} ·{" "}
                {l.transmission === "AUTOMATIC" ? "Automatic" : "Manual"} ·{" "}
                <a
                  href={`mailto:${l.user.email}`}
                  className="underline decoration-ink/30 underline-offset-2 hover:text-ink"
                >
                  {l.user.email}
                </a>
              </p>
              {l.goal && (
                <p className="mt-2 text-sm text-ink-soft">&ldquo;{l.goal}&rdquo;</p>
              )}
            </li>
          ))}
          {waiting.length === 0 && (
            <li className="rounded-2xl border border-hairline bg-paper p-5 text-[15px] text-ink-soft">
              No learners waiting yet. When the learner ad goes live, sign-ups
              without an instructor will appear here.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}
