import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { QUESTIONS } from "@/lib/theory/questions";
import TheoryPreview from "@/components/theory/TheoryPreview";

export const metadata = {
  title: "Try the theory practice free",
  description:
    "Try a few real driving theory questions free, no account needed. Then sign up for 375+ questions and mock tests.",
};

// A curated, text-only taster (a sign, a car-safety one, a hazard one).
const SAMPLE_IDS = ["q0326", "q0255", "q0294"];
const friendlyCount = Math.floor(QUESTIONS.length / 25) * 25;

export default function TheoryPreviewPage() {
  let samples = SAMPLE_IDS.map((id) => QUESTIONS.find((q) => q.id === id)).filter(
    (q): q is (typeof QUESTIONS)[number] => Boolean(q),
  );
  if (samples.length === 0) {
    samples = QUESTIONS.filter((q) => !q.sign).slice(0, 3);
  }
  const questions = samples.map((q) => ({
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }));

  return (
    <div className="relative z-10">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
          Free · no account needed
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Try the theory test.
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Here are three real questions from our practice bank — tap an answer to
          see if you&rsquo;re right and read the explanation. No sign-up to try.
        </p>

        <div className="mt-8">
          <TheoryPreview questions={questions} />
        </div>

        <div className="mt-8 rounded-3xl border border-sea/20 bg-sea/5 p-8 text-center">
          <h2 className="font-display text-2xl font-bold text-ink">
            Liked that? There are {friendlyCount}+ more.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-soft">
            Make a free account to unlock the full question bank, timed mock
            tests, and practice by topic. No card, no catch.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="press inline-flex items-center justify-center rounded-full bg-sea px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
            >
              Create free account
            </Link>
            <Link
              href="/"
              className="lift press inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
