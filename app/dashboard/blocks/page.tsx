import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import { blockBookingsEnabled } from "@/lib/flags";
import { formatHours } from "@/lib/credit";
import AddBlockForm from "@/components/blocks/AddBlockForm";
import BlockRowActions from "@/components/blocks/BlockRowActions";

export const metadata = { title: "Block packages" };
export const dynamic = "force-dynamic";

function money(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

type Pkg = {
  id: string;
  name: string;
  minutes: number;
  pricePence: number;
  active: boolean;
};

export default async function BlocksPage() {
  if (!blockBookingsEnabled()) redirect("/dashboard");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/dashboard");

  const packages: Pkg[] = await prisma.blockPackage.findMany({
    where: { instructorId: instructor.id },
    orderBy: [{ active: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Block packages
        </h1>
        <p className="mt-2 text-ink-soft">
          Offer your students blocks of hours to buy up front, usually at a small
          discount. They pay once, and the hours are drawn down as you book their
          lessons.
        </p>

        <div className="mt-5 rounded-2xl border border-line/60 bg-line/10 p-4 text-sm text-ink-soft">
          <p className="font-semibold text-ink">Before you take prepayments</p>
          <p className="mt-1.5">
            Taking money for lessons not yet given carries obligations (e.g.
            refunds if you stop trading). This feature is provided as-is and
            isn&rsquo;t legal advice — please make sure you&rsquo;re comfortable
            with your responsibilities before selling blocks.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          <h2 className="font-display text-lg font-semibold">Add a block</h2>
          <div className="mt-4">
            <AddBlockForm />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold">Your blocks</h2>
          {packages.length === 0 ? (
            <p className="mt-3 text-[15px] text-ink-soft">
              No blocks yet — add your first one above.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {packages.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5 ${
                    p.active ? "" : "opacity-60"
                  }`}
                >
                  <div>
                    <p className="font-semibold">
                      {p.name}
                      {!p.active && (
                        <span className="ml-2 text-xs font-medium text-ink-soft">
                          (hidden)
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {formatHours(p.minutes)} · {money(p.pricePence)}
                    </p>
                  </div>
                  <BlockRowActions id={p.id} active={p.active} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
