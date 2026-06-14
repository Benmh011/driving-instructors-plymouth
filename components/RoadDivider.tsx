"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="112" height="56" viewBox="0 0 120 60" fill="none" aria-hidden>
      <ellipse cx="62" cy="54" rx="50" ry="4.5" fill="#000000" opacity="0.1" />
      {/* body */}
      <path
        d="M12,47 Q7,47 7,41 L7,37 Q7,32 13,31 L22,30 Q27,14 46,13 L72,13 Q90,14 95,30 L103,31 Q109,32 109,37 L109,41 Q109,47 103,47 Z"
        fill="#2c8aa0"
      />
      {/* lower shade */}
      <path d="M12,47 Q7,47 7,41 L7,39 L109,39 L109,41 Q109,47 103,47 Z" fill="#1f6f82" />
      {/* windows */}
      <path d="M28,29 L33,17 L52,17 L52,29 Z" fill="#cfe7f0" />
      <path d="M57,29 L57,17 L70,17 Q84,18 86,29 Z" fill="#cfe7f0" />
      {/* wing mirror + handle */}
      <path d="M22,28 L15,29 L15,33 L22,31 Z" fill="#14202e" />
      <rect x="66" y="32" width="9" height="2.4" rx="1.2" fill="#14202e" />
      {/* L-plate */}
      <rect x="46" y="31" width="15" height="13" rx="2" fill="#c8362f" />
      <text
        x="53.5"
        y="41.5"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fontWeight="700"
        fill="#ffffff"
      >
        L
      </text>
      {/* wheels */}
      {[32, 90].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="46" r="10" fill="#14202e" />
          <circle cx={cx} cy="46" r="5.4" fill="#f2efe9" />
          <g stroke="#14202e" strokeWidth="1.6">
            <line x1={cx - 5} y1="46" x2={cx + 5} y2="46" />
            <line x1={cx} y1="41" x2={cx} y2="51" />
          </g>
          <circle cx={cx} cy="46" r="2.2" fill="#14202e" />
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
          // rAF guarantees the off-screen start frame paints first, so the
          // drive-in always animates (even if already in view on load).
          requestAnimationFrame(() => setDriven(true));
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // We drive on the left: car faces left, travels right -> left.
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
        {/* scrolling centre line */}
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
