"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="92" height="48" viewBox="0 0 92 48" fill="none" aria-hidden>
      {/* wheels */}
      <circle cx="30" cy="38" r="7.5" fill="#14202e" />
      <circle cx="30" cy="38" r="3" fill="#c9cdca" />
      <circle cx="72" cy="38" r="7.5" fill="#14202e" />
      <circle cx="72" cy="38" r="3" fill="#c9cdca" />
      {/* body */}
      <path
        d="M8 38 L8 30 Q8 26 12 26 L30 26 L38 15 Q39.5 13 43 13 L57 13 Q60 13 62 16 L68 26 L84 26 Q88 26 88 30 L88 38 Z"
        fill="#2c8aa0"
      />
      {/* window */}
      <path d="M39 25 L44 17 L56 17 L60 25 Z" fill="#dcecef" />
      {/* headlight */}
      <circle cx="86" cy="30" r="2" fill="#ffe6a3" />
      {/* rear L-plate */}
      <rect x="9" y="26.5" width="13" height="10.5" rx="2" fill="#c8362f" />
      <text
        x="15.5"
        y="35"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="700"
        fill="#ffffff"
      >
        L
      </text>
    </svg>
  );
}

function Flag() {
  return (
    <svg width="26" height="48" viewBox="0 0 26 48" fill="none" aria-hidden>
      <line x1="3" y1="4" x2="3" y2="46" stroke="#e7e9e7" strokeWidth="2.5" />
      <rect x="4" y="4" width="20" height="15" fill="#ffffff" />
      <g fill="#142436">
        <rect x="4" y="4" width="5" height="5" />
        <rect x="14" y="4" width="5" height="5" />
        <rect x="9" y="9" width="5" height="5" />
        <rect x="19" y="9" width="5" height="5" />
        <rect x="4" y="14" width="5" height="5" />
        <rect x="14" y="14" width="5" height="5" />
      </g>
    </svg>
  );
}

export function RoadDivider({
  progress = 60,
  finish = false,
}: {
  progress?: number;
  finish?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [driven, setDriven] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDriven(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative h-16 w-full overflow-hidden bg-[#5c626a]"
    >
      {/* lane markings */}
      <div
        className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, #f1f2f0 0, #f1f2f0 26px, transparent 26px, transparent 46px)",
        }}
      />

      {finish && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <Flag />
        </div>
      )}

      <div
        className="absolute top-1/2 w-[92px] -translate-y-1/2 transition-[left] duration-[2200ms] ease-out motion-reduce:transition-none"
        style={{ left: driven ? `calc(${progress}% - 46px)` : "-110px" }}
      >
        <Car />
      </div>
    </div>
  );
}
