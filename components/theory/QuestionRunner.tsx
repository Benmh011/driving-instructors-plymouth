"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/theory/questions";
import SignGraphic from "./SignGraphic";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  questions: Question[];
  mode: "practice" | "mock" | "study";
  mockCount?: number;
  passMark?: number;
  timeSeconds?: number;
  title: string;
  backHref: string;
};

export default function QuestionRunner({
  questions,
  mode,
  mockCount = 50,
  passMark = 43,
  timeSeconds = 57 * 60,
  title,
  backHref,
}: Props) {
  const [items, setItems] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [started, setStarted] = useState(mode !== "mock");
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeSeconds);
  const buildKey = useRef(0);

  // Build the item list on the client to avoid a hydration mismatch from
  // randomising during SSR.
  useEffect(() => {
    if (mode === "mock") {
      setItems(shuffle(questions).slice(0, Math.min(mockCount, questions.length)));
    } else {
      setItems(questions);
    }
    setIndex(0);
    setPicked({});
    setFinished(false);
    setTimeLeft(timeSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildKey.current]);

  // Mock countdown.
  useEffect(() => {
    if (mode !== "mock" || !started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, started, finished, timeLeft]);

  function restart() {
    buildKey.current += 1;
    setStarted(mode === "practice");
    // Force the build effect to re-run.
    setItems(null);
    setTimeout(() => {
      if (mode === "mock") {
        setItems(shuffle(questions).slice(0, Math.min(mockCount, questions.length)));
      } else {
        setItems(questions);
      }
      setIndex(0);
      setPicked({});
      setFinished(false);
      setTimeLeft(timeSeconds);
    }, 0);
  }

  const card = "rounded-2xl border border-hairline bg-cream p-6";

  if (!items) {
    return <p className="mt-8 text-ink-soft">Loading…</p>;
  }

  // Mock intro screen.
  if (mode === "mock" && !started) {
    return (
      <div className={`mt-8 ${card}`}>
        <h2 className="font-display text-2xl font-bold text-ink">Mock theory test</h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          {items.length} questions, {Math.round(timeSeconds / 60)} minutes. You need{" "}
          {passMark} correct to pass. You won&rsquo;t see answers until the end —
          just like the real thing.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-sea px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
        >
          Start the test
        </button>
      </div>
    );
  }

  // Results screen (mock).
  if (finished) {
    const correct = items.filter((q) => picked[q.id] === q.answer).length;
    const passed = correct >= passMark;
    return (
      <div className="mt-8 space-y-5">
        <div
          className={`rounded-2xl border p-6 ${
            passed ? "border-go/40 bg-go/10" : "border-signal/40 bg-signal/10"
          }`}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
            {passed ? "Pass" : "Not yet"}
          </p>
          <p className="mt-1 font-display text-4xl font-bold text-ink">
            {correct} / {items.length}
          </p>
          <p className="mt-2 text-[15px] text-ink-soft">
            {passed
              ? `That's above the ${passMark} pass mark — nice work.`
              : `You need ${passMark} to pass. Review the ones you missed and try again.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={restart}
              className="inline-flex items-center justify-center rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
            >
              Try another
            </button>
            <Link
              href={backHref}
              className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Done
            </Link>
          </div>
        </div>

        <h3 className="font-display text-lg font-semibold text-ink">Review</h3>
        <ul className="space-y-3">
          {items.map((q, n) => {
            const mine = picked[q.id];
            const right = mine === q.answer;
            return (
              <li key={q.id} className={card}>
                <p className="text-sm font-semibold text-ink-soft">Question {n + 1}</p>
                {q.sign && (
                  <div className="mt-2">
                    <SignGraphic id={q.sign} size={84} />
                  </div>
                )}
                <p className="mt-1 font-medium text-ink">{q.prompt}</p>
                <p className={`mt-2 text-sm ${right ? "text-go" : "text-signal"}`}>
                  {right ? "✓ Correct" : "✗ Your answer was wrong"}
                </p>
                {!right && mine != null && (
                  <p className="mt-1 text-sm text-ink-soft">
                    You chose: {q.options[mine]}
                  </p>
                )}
                <p className="mt-1 text-sm text-ink">
                  Correct answer: <strong>{q.options[q.answer]}</strong>
                </p>
                <p className="mt-1 text-sm text-ink-soft">{q.explanation}</p>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const q = items[index];
  const mine = picked[q.id];
  const revealed =
    (mode === "practice" && mine != null) ||
    (mode === "study" && revealedIds.has(q.id));

  function choose(optIndex: number) {
    if (mode === "study") {
      setRevealedIds((s) => new Set(s).add(q.id));
      return;
    }
    if (mode === "practice" && picked[q.id] != null) return; // lock after answering
    setPicked((p) => ({ ...p, [q.id]: optIndex }));
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between text-sm font-semibold text-ink-soft">
        <span>
          Question {index + 1} of {items.length}
        </span>
        {mode === "mock" ? (
          <span className={timeLeft < 300 ? "text-signal" : ""}>
            {mmss(timeLeft)} left
          </span>
        ) : (
          <span>{title}</span>
        )}
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-sea transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${((index + 1) / items.length) * 100}%` }}
        />
      </div>

      <div className={`mt-3 ${card}`}>
        {q.sign && (
          <div className="mb-4 flex justify-center rounded-xl bg-white py-5">
            <SignGraphic id={q.sign} />
          </div>
        )}
        <p className="font-display text-lg font-semibold text-ink">{q.prompt}</p>

        <ul className="mt-4 space-y-2.5">
          {q.options.map((opt, oi) => {
            const isMine = mine === oi;
            const isAnswer = oi === q.answer;
            let tone = "border-ink/15 bg-white hover:border-ink/40";
            if (revealed) {
              if (isAnswer) tone = "border-go bg-go/10";
              else if (isMine) tone = "border-signal bg-signal/10";
              else tone = "border-ink/10 bg-white opacity-70";
            } else if (isMine) {
              tone = "border-sea bg-sea/10";
            }
            return (
              <li key={oi}>
                <button
                  onClick={() => choose(oi)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${tone}`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-bold text-ink-soft">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="text-ink">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {mode === "study" && !revealed && (
          <button
            onClick={() => setRevealedIds((s) => new Set(s).add(q.id))}
            className="mt-4 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            Show answer
          </button>
        )}

        {revealed && (
          <div className="mt-4 rounded-xl border border-hairline bg-paper/60 p-4 text-[15px] text-ink-soft">
            {mode !== "study" && (
              <span className="font-semibold text-ink">
                {mine === q.answer ? "Correct. " : "Not quite. "}
              </span>
            )}
            {q.explanation}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink disabled:opacity-40"
        >
          Back
        </button>

        {index < items.length - 1 ? (
          <button
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={mode === "practice" && mine == null}
            className="rounded-full bg-sea px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-40"
          >
            Next
          </button>
        ) : mode === "mock" ? (
          <button
            onClick={() => setFinished(true)}
            className="rounded-full bg-go px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            Finish test
          </button>
        ) : (
          <Link
            href={backHref}
            className="rounded-full bg-sea px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
          >
            Done
          </Link>
        )}
      </div>
    </div>
  );
}
