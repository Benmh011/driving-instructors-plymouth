import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import SignGraphic from "@/components/theory/SignGraphic";
import FlagForm from "@/components/theory/FlagForm";
import { TOPICS, QUESTIONS } from "@/lib/theory/questions";

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
  const flagCount = new Map<string, number>(
    open.map((o: { questionId: string; _count: { _all: number } }) => [
      o.questionId,
      o._count._all,
    ]),
  );

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink href="/theory" label="Theory" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Review questions
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Every question with its answer shown. Spot something wrong or unclear?
          Flag it and we&rsquo;ll fix it.
        </p>

        {TOPICS.filter((t) => QUESTIONS.some((q) => q.topic === t)).map((topic) => (
          <section key={topic} className="mt-9">
            <h2 className="font-display text-xl font-bold text-ink">{topic}</h2>
            <ul className="mt-3 space-y-3">
              {QUESTIONS.filter((q) => q.topic === topic).map((q) => {
                const flags = flagCount.get(q.id) ?? 0;
                return (
                  <li
                    key={q.id}
                    className="rounded-2xl border border-hairline bg-cream p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                        {q.id}
                      </p>
                      {flags > 0 && (
                        <span className="rounded-full bg-line/20 px-2.5 py-0.5 text-xs font-semibold text-ink">
                          {flags} open flag{flags > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {q.sign && (
                      <div className="mt-2">
                        <SignGraphic id={q.sign} size={80} />
                      </div>
                    )}
                    <p className="mt-1 font-medium text-ink">{q.prompt}</p>
                    <ul className="mt-2 space-y-1">
                      {q.options.map((opt, oi) => (
                        <li
                          key={oi}
                          className={`text-sm ${
                            oi === q.answer
                              ? "font-semibold text-go"
                              : "text-ink-soft"
                          }`}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                          {oi === q.answer && " ✓"}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm text-ink-soft">
                      <span className="font-semibold text-ink">Why: </span>
                      {q.explanation}
                    </p>
                    <FlagForm questionId={q.id} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
