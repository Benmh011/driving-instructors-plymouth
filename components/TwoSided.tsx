"use client";

import { useState } from "react";
import { RoadDivider } from "./RoadDivider";

const CONTENT = {
  learners: {
    eyebrow: "I'm learning to drive",
    heading: "Spend less time chasing, more time driving.",
    points: [
      "Vetted, DVSA-approved instructors near you",
      "Transparent pricing — see the cost before you commit",
      "Live availability and instant booking",
      "Manual or automatic, your choice of car",
      "Track lessons and test-readiness in one place",
    ],
    cta: "Find an instructor",
  },
  instructors: {
    eyebrow: "I'm an instructor",
    heading: "Fill your diary with local learners.",
    points: [
      "Get found by learners in your exact coverage area",
      "Set your own prices, hours and lesson types",
      "Fewer no-shows with deposits and reminders",
      "One calendar — no double-bookings, no admin pile-up",
      "Keep your earnings: no booking fees at launch",
    ],
    cta: "List your lessons",
  },
};

type Side = keyof typeof CONTENT;

export function TwoSided() {
  const [side, setSide] = useState<Side>("learners");
  const data = CONTENT[side];

  return (
    <section
      id="instructors"
      className="relative overflow-hidden bg-tarmac text-paper"
    >
      <RoadDivider progress={45} />
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        {/* toggle */}
        <div className="mb-14 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
          {(Object.keys(CONTENT) as Side[]).map((key) => (
            <button
              key={key}
              onClick={() => setSide(key)}
              className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                side === key
                  ? "bg-signal text-white"
                  : "text-paper/70 hover:text-paper"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-line">
              {data.eyebrow}
            </span>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              {data.heading}
            </h2>
            <a
              href={side === "instructors" ? "/register?role=instructor" : "/register"}
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-signal-dark"
            >
              {data.cta}
              <span aria-hidden>→</span>
            </a>
          </div>

          <ul className="space-y-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            {data.points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3.5 border-b border-white/10 px-5 py-4 last:border-b-0"
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sea text-white">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[15px] leading-snug text-paper/90">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <RoadDivider progress={72} />
    </section>
  );
}
