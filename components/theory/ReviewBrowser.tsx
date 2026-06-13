"use client";

import { useMemo, useState } from "react";
import { QUESTIONS, TOPICS, type Topic } from "@/lib/theory/questions";
import SignGraphic from "./SignGraphic";
import FlagForm from "./FlagForm";

type Sort = "number" | "topic" | "flags";

export default function ReviewBrowser({
  flagCounts,
}: {
  flagCounts: Record<string, number>;
}) {
  const [topic, setTopic] = useState<"all" | Topic>("all");
  const [query, setQuery] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("number");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = QUESTIONS.filter((item) => {
      if (topic !== "all" && item.topic !== topic) return false;
      if (flaggedOnly && !((flagCounts[item.id] ?? 0) > 0)) return false;
      if (q) {
        const hay = `${item.prompt} ${item.id} ${item.options.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...list];
    if (sort === "topic") {
      sorted.sort((a, b) => a.topic.localeCompare(b.topic) || a.id.localeCompare(b.id));
    } else if (sort === "flags") {
      sorted.sort(
        (a, b) => (flagCounts[b.id] ?? 0) - (flagCounts[a.id] ?? 0) || a.id.localeCompare(b.id),
      );
    } else {
      sorted.sort((a, b) => a.id.localeCompare(b.id));
    }
    return sorted;
  }, [topic, query, flaggedOnly, sort, flagCounts]);

  const totalFlagged = QUESTIONS.filter((q) => (flagCounts[q.id] ?? 0) > 0).length;
  const field =
    "rounded-xl border border-ink/20 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-ink";

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-hairline bg-cream p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className={`${field} w-full`}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Topic
            </span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as "all" | Topic)}
              className={`${field} w-full`}
            >
              <option value="all">All topics</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Sort by
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className={`${field} w-full`}
            >
              <option value="number">Question number</option>
              <option value="topic">Topic</option>
              <option value="flags">Most flagged</option>
            </select>
          </label>
        </div>
        <button
          onClick={() => setFlaggedOnly((v) => !v)}
          className={`mt-3 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            flaggedOnly
              ? "border-line bg-line/20 text-ink"
              : "border-ink/20 text-ink hover:border-ink"
          }`}
        >
          {flaggedOnly ? "Showing flagged only" : "Show flagged only"}
          {totalFlagged > 0 && ` (${totalFlagged})`}
        </button>
      </div>

      <p className="mt-4 text-sm font-semibold text-ink-soft">
        Showing {filtered.length} of {QUESTIONS.length}
      </p>

      <ul className="mt-3 space-y-3">
        {filtered.map((q) => {
          const flags = flagCounts[q.id] ?? 0;
          return (
            <li key={q.id} className="rounded-2xl border border-hairline bg-cream p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {q.id} · {q.topic}
                </p>
                {flags > 0 && (
                  <span className="shrink-0 rounded-full bg-line/20 px-2.5 py-0.5 text-xs font-semibold text-ink">
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
                      oi === q.answer ? "font-semibold text-go" : "text-ink-soft"
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
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-hairline bg-cream p-5 text-[15px] text-ink-soft">
            No questions match. Try clearing the filters.
          </li>
        )}
      </ul>
    </div>
  );
}
