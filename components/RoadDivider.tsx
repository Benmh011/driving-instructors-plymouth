"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="108" height="54" viewBox="0 0 112 56" fill="none" aria-hidden>
      <ellipse cx="58" cy="51" rx="48" ry="4.5" fill="#000000" opacity="0.1" />
      {/* body */}
      <path
        d="M12,46 Q7,46 7,40 L7,36 Q7,31 13,30 L22,29 Q27,14 45,13 L66,13 Q83,14 88,29 L96,30 Q101,31 101,36 L101,40 Q101,46 96,46 Z"
        fill="#2c8aa0"
      />
      {/* lower shade */}
      <path d="M12,46 Q7,46 7,40 L7,38 L101,38 L101,40 Q101,46 96,46 Z" fill="#1f6f82" />
      {/* windows */}
      <path d="M28,28 L33,16.5 L50,16.5 L50,28 Z" fill="#cfe7f0" />
      <path d="M55,28 L55,16.5 L66,16.5 Q80,17.5 82,28 Z" fill="#cfe7f0" />
      {/* headlight (front, so direction reads clearly) */}
      <ellipse cx="9.5" cy="36.5" rx="2.4" ry="3" fill="#ffe79a" />
      <ellipse cx="9.5" cy="36.5" rx="1" ry="1.6" fill="#ffffff" />
      {/* tail light (rear) */}
      <rect x="98.2" y="34.5" width="2.6" height="4.5" rx="1" fill="#c8362f" />
      {/* wing mirror + handle */}
      <path d="M22,27 L15,28 L15,31.5 L22,30 Z" fill="#14202e" />
      <rect x="64" y="31" width="9" height="2.3" rx="1.1" fill="#14202e" />
      {/* L-plate */}
      <rect x="45" y="30" width="15" height="12.5" rx="2" fill="#c8362f" />
      <text
        x="52.5"
        y="40"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11.5"
        fontWeight="700"
        fill="#ffffff"
      >
        L
      </text>
      {/* wheels */}
      {[30, 84].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="45" r="9.5" fill="#14202e" />
          <circle cx={cx} cy="45" r="5.1" fill="#f2efe9" />
          <g stroke="#14202e" strokeWidth="1.5">
            <line x1={cx - 4.7} y1="45" x2={cx + 4.7} y2="45" />
            <line x1={cx} y1="40.3" x2={cx} y2="49.7" />
          </g>
          <circle cx={cx} cy="45" r="2.1" fill="#14202e" />
        </g>
      ))}
    </svg>
  );
}

function Flag() {
  const cells = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      if ((r + c) % 2 === 0) {
        cells.push(
          <rect key={`${r}-${c}`} x={6 + c * 7} y={5 + r * 6} width="7" height="6" fill="#142436" />,
        );
      }
    }
  }
  return (
    <svg width="32" height="44" viewBox="0 0 40 54" fill="none" aria-hidden>
      <line x1="6" y1="3" x2="6" y2="50" stroke="#7c828a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="6" cy="3.5" r="2.6" fill="#7c828a" />
      <g className="flag-wave">
        <rect x="6" y="5" width="28" height="18" fill="#ffffff" />
        {cells}
        <rect x="6" y="5" width="28" height="18" fill="none" stroke="#142436" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

export function RoadDivider({
  progress = 60,
  finish = false,
  dark = false,
}: {
  progress?: number;
  finish?: boolean;
  dark?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [driven, setDriven] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => setDriven(true));
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Car faces left and travels right -> left.
  const left = driven ? `calc(${100 - progress}% - 56px)` : "calc(100% + 24px)";

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative h-20 w-full overflow-hidden ${dark ? "bg-tarmac" : "bg-paper"}`}
    >
      {/* asphalt */}
      <div className="absolute inset-x-0 bottom-0 h-7 bg-[#5c626a]">
        {/* kerb highlight */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-white/15" />
        {/* scrolling centre line (moves right, matching a left-bound car) */}
        <div
          className="road-scroll absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to right, #f1f2f0 0, #f1f2f0 26px, transparent 26px, transparent 46px)",
          }}
        />
      </div>

      {finish && (
        <div className="absolute bottom-1 left-6">
          <Flag />
        </div>
      )}

      <div
        className="absolute bottom-0.5 w-[112px] transition-[left] duration-[2200ms] ease-out motion-reduce:transition-none"
        style={{ left }}
      >
        <div className="car-bob">
          <Car />
        </div>
      </div>
    </div>
  );
}
