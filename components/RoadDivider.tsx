"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="64" height="34" viewBox="0 0 64 34" fill="none" aria-hidden>
      {/* wheels */}
      <circle cx="17" cy="27" r="5.2" fill="#14202e" />
      <circle cx="17" cy="27" r="2" fill="#c9cdca" />
      <circle cx="46" cy="27" r="5.2" fill="#14202e" />
      <circle cx="46" cy="27" r="2" fill="#c9cdca" />
      {/* body */}
      <path
        d="M5 26 L5 21 Q5 18 8 18 L20 18 L26 11 Q27 10 29 10 L40 10 Q42 10 43 12 L47 18 L58 18 Q60 18 60 21 L60 26 Z"
        fill="#2c8aa0"
      />
      {/* window */}
      <path d="M27 17 L31 13 L40 13 L43 17 Z" fill="#dcecef" />
      {/* headlight */}
      <circle cx="59" cy="21.5" r="1.5" fill="#ffe6a3" />
      {/* rear L-plate */}
      <rect x="5" y="18.5" width="8.5" height="8.5" rx="1.5" fill="#c8362f" />
      <text
        x="9.25"
        y="25.2"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="7"
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
    <svg width="22" height="34" viewBox="0 0 22 34" fill="none" aria-hidden>
      <line x1="3" y1="2" x2="3" y2="34" stroke="#c9cdca" strokeWidth="2" />
      <rect x="4" y="2" width="16" height="11" fill="#ffffff" />
      <g fill="#142436">
        <rect x="4" y="2" width="4" height="3.6" />
        <rect x="12" y="2" width="4" height="3.6" />
        <rect x="8" y="5.6" width="4" height="3.6" />
        <rect x="16" y="5.6" width="4" height="3.6" />
        <rect x="4" y="9.2" width="4" height="3.8" />
        <rect x="12" y="9.2" width="4" height="3.8" />
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
    <div ref={ref} aria-hidden className="relative h-16 w-full overflow-hidden">
      {/* tarmac */}
      <div className="absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 bg-tarmac-soft">
        <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/25" />
        <div
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, #ffffff 0, #ffffff 22px, transparent 22px, transparent 40px)",
          }}
        />
      </div>

      {finish && (
        <div className="absolute right-5 top-1/2 -translate-y-[62%]">
          <Flag />
        </div>
      )}

      <div
        className="absolute top-1/2 w-16 -translate-y-[78%] transition-[left] duration-[2200ms] ease-out motion-reduce:transition-none"
        style={{ left: driven ? `calc(${progress}% - 32px)` : "-72px" }}
      >
        <Car />
      </div>
    </div>
  );
}
