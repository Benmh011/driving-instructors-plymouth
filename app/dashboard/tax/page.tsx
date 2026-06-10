import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import ExpenseForm from "@/components/tax/ExpenseForm";
import DeleteExpenseButton from "@/components/tax/DeleteExpenseButton";
import TaxCalendar from "@/components/tax/TaxCalendar";
import CollapsiblePanel from "@/components/tax/CollapsiblePanel";
import { accessState, hasFullAccess } from "@/lib/subscription";

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

  // Tax & earnings is a paid feature — blank it behind the paywall when locked.
  if (!hasFullAccess(accessState(user.instructorProfile))) {
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
          <section className="mt-8 rounded-2xl border border-signal/40 bg-signal/10 p-6">
            <h1 className="font-display text-2xl font-bold text-ink">
              Tax &amp; earnings is locked
            </h1>
            <p className="mt-2 text-[15px] text-ink-soft">
              Your subscription has ended. Resubscribe to see your income, log
              expenses and track your Self Assessment figures again.
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

  const instructorId = user.instructorProfile.id;
  const now = new Date();
  const curStart = currentTaxYearStart(now);

  let startYear = Number.parseInt(year ?? "", 10);
  if (Number.isNaN(startYear) || startYear < 2015 || startYear > curStart) {
    startYear = curStart;
  }

  const rangeStart = new Date(Date.UTC(startYear, 3, 6));
  const rangeEnd = new Date(Date.UTC(startYear + 1, 3, 6));

  const paidLessons: {
    start: Date;
    pricePence: number | null;
    learner: { user: { name: string | null } | null } | null;
  }[] = await prisma.booking.findMany({
    where: {
      instructorId,
      paid: true,
      status: { not: "CANCELLED" },
      start: { gte: rangeStart, lt: rangeEnd },
    },
    select: {
      start: true,
      pricePence: true,
      learner: { select: { user: { select: { name: true } } } },
    },
  });
  const income = paidLessons.reduce((sum, b) => sum + (b.pricePence ?? 0), 0);

  // Completed lessons that haven't been marked paid yet — money still owed.
  const unpaid: { pricePence: number | null }[] = await prisma.booking.findMany({
    where: {
      instructorId,
      paid: false,
      status: "COMPLETED",
      start: { gte: rangeStart, lt: rangeEnd },
    },
    select: { pricePence: true },
  });
  const outstandingTotal = unpaid.reduce((sum, b) => sum + (b.pricePence ?? 0), 0);

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

  const calLessons = paidLessons.map((b) => ({
    start: new Date(b.start).toISOString(),
    pricePence: b.pricePence ?? 0,
    name: b.learner?.user?.name ?? "a learner",
  }));
  const calExpenses = expenses.map((e) => ({
    id: e.id,
    date: new Date(e.date).toISOString(),
    category: e.category,
    amountPence: e.amountPence,
    note: e.note,
  }));

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
          Income from lessons you&rsquo;ve marked as paid, minus expenses, for the UK tax
          year (6 Apr &ndash; 5 Apr).
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
              {paidLessons.length} paid lesson{paidLessons.length === 1 ? "" : "s"}
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

        {outstandingTotal > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line/40 bg-line/10 p-4">
            <span className="text-xl">💷</span>
            <p className="text-[15px] text-ink">
              <span className="font-semibold">{money(outstandingTotal)} awaiting payment</span>{" "}
              <span className="text-ink-soft">
                &mdash; {unpaid.length} completed lesson{unpaid.length === 1 ? "" : "s"} not yet
                marked paid.
              </span>
            </p>
          </div>
        )}

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

        {/* Day view */}
        <TaxCalendar lessons={calLessons} expenses={calExpenses} />

        {/* Add expense */}
        <CollapsiblePanel title="Add an expense">
          <ExpenseForm year={startYear} />
        </CollapsiblePanel>

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
          lessons you&rsquo;ve marked as paid in your diary. Check current HMRC rules
          (including Making Tax Digital) or speak to an accountant for anything specific
          to your situation.
        </p>
      </main>
    </div>
  );
}
