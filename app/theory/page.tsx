import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import { theoryAccess } from "@/lib/theory/access";
import { TOPICS, topicCount, topicSlug, QUESTIONS } from "@/lib/theory/questions";

export const metadata = { title: "Theory test practice" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink />
        {children}
      </main>
    </div>
  );
}

export default async function TheoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const gate = await theoryAccess();

  if (!gate.ok) {
    const copy: Record<string, { title: string; body: string }> = {
      login: { title: "Please sign in", body: "Sign in to use theory practice." },
      "no-instructor": {
        title: "Theory practice unlocks with your instructor",
        body: "Once you're on a driving instructor's student list here, you'll get full theory practice and mock tests as part of your lessons.",
      },
      "instructor-inactive": {
        title: "Theory practice is paused",
        body: "Your instructor's subscription isn't active right now, so theory practice is temporarily unavailable. Have a word with them and it'll be back.",
      },
      subscribe: {
        title: "Subscribe to preview theory tests",
        body: "Theory practice is part of your subscription. Resubscribe to preview what your students get.",
      },
    };
    const c = copy[gate.reason];
    return (
      <Shell>
        <section className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          <h1 className="font-display text-2xl font-bold text-ink">{c.title}</h1>
          <p className="mt-2 text-[15px] text-ink-soft">{c.body}</p>
          {gate.reason === "subscribe" && (
            <Link
              href="/dashboard/billing"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
            >
              Go to subscription
            </Link>
          )}
        </section>
      </Shell>
    );
  }

  const activeTopics = TOPICS.filter((t) => topicCount(t) > 0);

  return (
    <Shell>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Theory practice
      </h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        Revise by topic, then sit a full mock test under timed conditions. Built
        to mirror the real car theory test.
      </p>

      <Link
        href="/theory/mock"
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-sea/30 bg-sea/10 p-6 transition-colors hover:border-sea/50"
      >
        <div>
          <p className="font-display text-xl font-bold text-ink">Mock test</p>
          <p className="mt-1 text-[15px] text-ink-soft">
            {Math.min(50, QUESTIONS.length)} questions · timed · pass mark 43
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white">
          Start
        </span>
      </Link>

      <h2 className="mt-10 font-display text-2xl font-bold tracking-tight text-ink">
        Practise by topic
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {activeTopics.map((t) => (
          <li key={t}>
            <Link
              href={`/theory/practice/${topicSlug(t)}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-cream p-4 transition-colors hover:border-ink/20"
            >
              <span className="font-semibold text-ink">{t}</span>
              <span className="shrink-0 text-sm font-semibold text-ink-soft">
                {topicCount(t)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
