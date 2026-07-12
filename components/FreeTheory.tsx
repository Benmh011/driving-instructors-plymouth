import Link from "next/link";
import { QUESTIONS } from "@/lib/theory/questions";

// Round down to a friendly "N+" so this never needs editing as the bank grows.
const questionCount = Math.floor(QUESTIONS.length / 25) * 25;

const POINTS = [
  {
    title: `${questionCount}+ practice questions`,
    body: "Written by us to the DVSA and Highway Code, every one with a plain-English explanation.",
  },
  {
    title: "Timed mock tests",
    body: "Sit a full 50-question mock under real exam conditions and see if you'd pass.",
  },
  {
    title: "Practise by topic",
    body: "Weak on road signs or motorway rules? Drill one topic at a time until it sticks.",
  },
];

export function FreeTheory() {
  return (
    <section
      id="theory"
      className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="rounded-3xl border border-sea/20 bg-sea/5 p-8 sm:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
              Free for learners
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Pass your theory,{" "}
              <span className="text-sea">free.</span>
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              No catch and no card details. Make a free account and practise the
              multiple-choice theory test as much as you like — on your phone,
              whenever suits you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-sea px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
              >
                Start practising free
              </Link>
              <Link
                href="/theory"
                className="inline-flex items-center justify-center rounded-full border border-ink/20 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                See how it works
              </Link>
            </div>
          </div>

          <ul className="grid gap-4">
            {POINTS.map((p) => (
              <li
                key={p.title}
                className="rounded-2xl border border-ink/10 bg-white/70 p-5"
              >
                <p className="font-display text-lg font-bold text-ink">
                  {p.title}
                </p>
                <p className="mt-1 text-[15px] text-ink-soft">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
