import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import { questionById } from "@/lib/theory/questions";
import { setFeedbackResolved, deleteFeedback } from "./actions";

export const metadata = { title: "Theory feedback" };

type Row = {
  id: string;
  questionId: string;
  comment: string;
  resolved: boolean;
  createdAt: Date;
  instructor: { user: { name: string } } | null;
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function AdminTheoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!isAdminEmail(me?.email)) redirect("/dashboard");

  const feedback: Row[] = await prisma.theoryFeedback.findMany({
    orderBy: [{ resolved: "asc" }, { createdAt: "desc" }],
    include: { instructor: { include: { user: { select: { name: true } } } } },
  });

  const open = feedback.filter((f) => !f.resolved);
  const done = feedback.filter((f) => f.resolved);

  function card(f: Row) {
    const q = questionById(f.questionId);
    return (
      <li
        key={f.id}
        className={`rounded-2xl border p-5 ${
          f.resolved ? "border-hairline bg-paper/50" : "border-line/50 bg-line/10"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {f.questionId}
            {f.instructor && ` · ${f.instructor.user.name}`} · {fmt(f.createdAt)}
          </p>
        </div>
        {q ? (
          <>
            <p className="mt-1 font-medium text-ink">{q.prompt}</p>
            <p className="mt-1 text-sm text-go">
              Current answer: {q.options[q.answer]}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-signal">
            Question no longer exists in the bank.
          </p>
        )}
        <p className="mt-2 rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink">
          {f.comment}
        </p>
        <div className="mt-3 flex gap-2">
          <form action={setFeedbackResolved.bind(null, f.id, !f.resolved)}>
            <button
              type="submit"
              className="rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
            >
              {f.resolved ? "Reopen" : "Mark resolved"}
            </button>
          </form>
          <form action={deleteFeedback.bind(null, f.id)}>
            <button
              type="submit"
              className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-signal hover:text-signal"
            >
              Delete
            </button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Theory feedback
        </h1>
        <p className="mt-3 text-ink-soft">
          Issues instructors have flagged on theory questions.
        </p>

        <h2 className="mt-8 font-display text-xl font-bold text-ink">
          Open ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="mt-3 text-[15px] text-ink-soft">Nothing open. Nice.</p>
        ) : (
          <ul className="mt-3 space-y-3">{open.map(card)}</ul>
        )}

        {done.length > 0 && (
          <>
            <h2 className="mt-10 font-display text-xl font-bold text-ink">
              Resolved ({done.length})
            </h2>
            <ul className="mt-3 space-y-3">{done.map(card)}</ul>
          </>
        )}
      </main>
    </div>
  );
}
