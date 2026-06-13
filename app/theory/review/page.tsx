import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import ReviewBrowser from "@/components/theory/ReviewBrowser";

export const metadata = { title: "Review theory questions" };

export default async function TheoryReviewPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (!user || user.role !== "INSTRUCTOR") redirect("/theory");

  // Count open flags per question so reviewers can see what's already been raised.
  const open = await prisma.theoryFeedback.groupBy({
    by: ["questionId"],
    where: { resolved: false },
    _count: { _all: true },
  });
  const flagCounts: Record<string, number> = {};
  for (const o of open as { questionId: string; _count: { _all: number } }[]) {
    flagCounts[o.questionId] = o._count._all;
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink href="/theory" label="Theory" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Review questions
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Filter, search and sort the whole question bank however you like. Spot
          something wrong or unclear? Flag it and we&rsquo;ll fix it.
        </p>

        <div className="mt-6 rounded-2xl border border-sea/30 bg-sea/10 p-5">
          <p className="font-display text-lg font-bold text-ink">
            See what your students get
          </p>
          <p className="mt-1 text-[15px] text-ink-soft">
            Sit the real thing yourself — nothing is recorded against your account.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/theory/mock"
              className="inline-flex items-center justify-center rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
            >
              Preview a mock test
            </Link>
            <Link
              href="/theory/study"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Study mode
            </Link>
            <Link
              href="/theory"
              className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Student view
            </Link>
          </div>
        </div>

        <ReviewBrowser flagCounts={flagCounts} />
      </main>
    </div>
  );
}
