import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import ExpenseForm from "@/components/tax/ExpenseForm";
import DeleteExpenseButton from "@/components/tax/DeleteExpenseButton";

export const metadata = { title: "Tax & earnings" };

function money(pence: number) {
  const sign = pence < 0 ? "\u2212" : "";
  return `${sign}\u00a3${(Math.abs(pence) / 100).toFixed(2)}`;
}

function taxYearLabel(start: number) {
  return `${start}/${String(start + 1).slice(2)}`;
}

function currentTaxYearStart(now: Date) {
  const y = now.getUTCFullYear();
  const afterApr6 =
    now.getUTCMonth() > 3 || (now.getUTCMonth() === 3 && now.getUTCDate() >= 6);
  return afterApr6 ? y : y - 1;
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function TaxPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instructorProfile: true },
  });
  if (!user) redirect("/login");
  if (user.role !== "INSTRUCTOR" || !user.instructorProfile) redirect("/dashboard");

  const instructorId = user.instructorProfile.id;
  const now = new Date();
  const curStart = currentTaxYearStart(now);

  let startYear = Number.parseInt(year ?? "", 10);
  if (Number.isNaN(startYear) || startYear < 2015 || startYear > curStart) {
    startYear = curStart;
  }

  const rangeStart = new Date(Date.UTC(startYear, 3, 6));
  const rangeEnd = new Date(Date.UTC(startYear + 1, 3, 6));

  const completed: { pricePence: number | null }[] = await prisma.booking.findMany({
    where: {
      instructorId,
      status: "COMPLETED",
      start: { gte: rangeStart, lt: rangeEnd },
    },
    select: { pricePence: true },
  });
  const income = completed.reduce((sum, b) => sum + (b.pricePence ?? 0), 0);

  const expenses: {
    id: string;
    date: string | Date;
    category: string;
    amountPence: number;
    note: string | null;
  }[] = await prisma.expense.findMany({
    where: { instructorId, date: { gte: rangeStart, lt: rangeEnd } },
    orderBy: { date: "desc" },
  });
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amountPence, 0);
  const net = income - expenseTotal;

  const byCat = new Map<string, number>();
  for (const e of expenses) {
    byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amountPence);
  }
  const categories = [...byCat.entries()].sort((a, b) => b[1] - a[1]);

  const years = [curStart, curStart - 1, curStart - 2];

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Tax &amp; earnings
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Income from your completed lessons, minus expenses, for the UK tax year (6 Apr
          &ndash; 5 Apr).
        </p>

        {/* Tax year selector */}
        <div className="mt-6 flex flex-wrap gap-2">
          {years.map((y) => (
            <Link
              key={y}
              href={`/dashboard/tax?year=${y}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                y === startYear
                  ? "bg-tarmac text-paper"
                  : "border border-ink/20 text-ink-soft hover:border-ink hover:text-ink"
              }`}
            >
              {taxYearLabel(y)}
            </Link>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          <div className="bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Income
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{money(income)}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {completed.length} completed lesson{completed.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Expenses
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{money(expenseTotal)}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {expenses.length} item{expenses.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Net profit
            </p>
            <p
              className={`mt-1 font-display text-2xl font-bold ${
                net < 0 ? "text-signal" : "text-go"
              }`}
            >
              {money(net)}
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">income &minus; expenses</p>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mt-4 rounded-2xl border border-hairline bg-cream p-5">
            <p className="text-sm font-semibold">Expenses by category</p>
            <ul className="mt-2 space-y-1">
              {categories.map(([cat, total]) => (
                <li key={cat} className="flex justify-between text-[15px]">
                  <span className="text-ink-soft">{cat}</span>
                  <span className="font-medium">{money(total)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Add expense */}
        <section className="mt-9 rounded-2xl border border-hairline bg-cream p-6">
          <p className="font-display text-lg font-semibold">Add an expense</p>
          <div className="mt-4">
            <ExpenseForm year={startYear} />
          </div>
        </section>

        {/* Expense list */}
        <h2 className="mt-9 font-display text-2xl font-bold tracking-tight">
          Expenses &mdash; {taxYearLabel(startYear)}
        </h2>
        {expenses.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="text-[15px] text-ink-soft">
              No expenses logged for this tax year yet.
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {expenses.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {money(e.amountPence)}{" "}
                    <span className="font-normal text-ink-soft">&middot; {e.category}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-ink-soft">
                    {fmtDate(e.date)}
                    {e.note ? ` · ${e.note}` : ""}
                  </p>
                </div>
                <DeleteExpenseButton id={e.id} />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-sm leading-relaxed text-ink-soft">
          This is a running summary to help you prepare your Self Assessment &mdash; it
          isn&rsquo;t submitted to HMRC and isn&rsquo;t tax advice. Income is counted from
          lessons you&rsquo;ve marked complete in your diary. Check current HMRC rules
          (including Making Tax Digital) or speak to an accountant for anything specific
          to your situation.
        </p>
      </main>
    </div>
  );
}
