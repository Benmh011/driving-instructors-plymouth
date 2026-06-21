import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import { blockBookingsEnabled } from "@/lib/flags";
import { formatHours } from "@/lib/credit";
import { previewCreditRefund } from "@/lib/credit-refund";
import RefundCreditButton from "@/components/credit/RefundCreditButton";
import RefundAllCreditButton from "@/components/credit/RefundAllCreditButton";

export const metadata = { title: "Prepaid credit" };
export const dynamic = "force-dynamic";

function money(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

type Student = {
  learnerId: string;
  name: string;
  balanceMinutes: number;
  refundablePence: number;
};

export default async function CreditAdminPage() {
  if (!blockBookingsEnabled()) redirect("/dashboard");

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!instructor) redirect("/dashboard");

  const grouped = await prisma.creditEntry.groupBy({
    by: ["learnerId"],
    where: { instructorId: instructor.id },
    _sum: { deltaMinutes: true },
  });
  const owing = grouped.filter(
    (g: { learnerId: string; _sum: { deltaMinutes: number | null } }) =>
      (g._sum.deltaMinutes ?? 0) > 0,
  );

  const profiles: { id: string; user: { name: string } }[] =
    await prisma.learnerProfile.findMany({
      where: {
        id: { in: owing.map((g: { learnerId: string }) => g.learnerId) },
      },
      select: { id: true, user: { select: { name: true } } },
    });
  const nameById = new Map(profiles.map((p) => [p.id, p.user.name]));

  const students: Student[] = [];
  for (const g of owing) {
    const preview = await previewCreditRefund(instructor.id, g.learnerId);
    students.push({
      learnerId: g.learnerId,
      name: nameById.get(g.learnerId) ?? "Student",
      balanceMinutes: g._sum.deltaMinutes ?? 0,
      refundablePence: preview.refundablePence,
    });
  }
  students.sort((a, b) => b.refundablePence - a.refundablePence);

  const totalPence = students.reduce((s, x) => s + x.refundablePence, 0);

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <BackLink />

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Prepaid credit
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-ink-soft">
          Hours your students have paid for up front but not yet used. If you
          stop teaching a student — or close your account — refund their unused
          hours here. Refunds are pro-rata: only the hours they haven&rsquo;t
          taken are returned, straight to the card that paid.
        </p>

        {students.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-hairline bg-cream p-6 text-[15px] text-ink-soft">
            No students are holding prepaid hours right now.
          </p>
        ) : (
          <>
            <ul className="mt-8 space-y-3">
              {students.map((s) => (
                <li
                  key={s.learnerId}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {formatHours(s.balanceMinutes)} unused
                      {s.refundablePence > 0 && (
                        <> · {money(s.refundablePence)} refundable</>
                      )}
                    </p>
                  </div>
                  <RefundCreditButton
                    learnerId={s.learnerId}
                    amountLabel={
                      s.refundablePence > 0 ? money(s.refundablePence) : null
                    }
                  />
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-signal/30 bg-signal/5 p-5">
              <p className="text-sm font-semibold text-ink">
                Closing your account or stopping lessons?
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                Refund every student&rsquo;s unused hours in one go
                {totalPence > 0 && <> — about {money(totalPence)} in total</>}.
              </p>
              <div className="mt-4">
                <RefundAllCreditButton count={students.length} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
