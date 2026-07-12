"use client";

import { useState } from "react";

type Q = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export default function TheoryPreview({ questions }: { questions: Q[] }) {
  return (
    <div className="space-y-5">
      {questions.map((q, i) => (
        <PreviewCard key={i} q={q} n={i + 1} total={questions.length} />
      ))}
    </div>
  );
}

function PreviewCard({ q, n, total }: { q: Q; n: number; total: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="rounded-2xl border border-hairline bg-cream p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        Question {n} of {total}
      </p>
      <p className="mt-2 font-display text-lg font-bold text-ink">{q.prompt}</p>

      <div className="mt-4 space-y-2.5">
        {q.options.map((opt, idx) => {
          const isCorrect = idx === q.answer;
          const isPicked = idx === picked;
          let cls = "border-ink/15 bg-white hover:border-ink/40";
          if (answered && isCorrect) cls = "border-go bg-go/10";
          else if (answered && isPicked) cls = "border-signal bg-signal/10";
          else if (answered) cls = "border-ink/10 bg-white/50 text-ink-soft";
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => setPicked(idx)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-medium text-ink transition-colors ${cls}`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
              {answered && isCorrect && (
                <span className="ml-auto font-bold text-go">✓</span>
              )}
              {answered && isPicked && !isCorrect && (
                <span className="ml-auto font-bold text-signal">✗</span>
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <p className="mt-4 rounded-xl bg-sea/10 p-4 text-[15px] text-ink">
          <strong>
            {picked === q.answer ? "Correct! " : "Not quite — "}
          </strong>
          {q.explanation}
        </p>
      )}
    </div>
  );
}
