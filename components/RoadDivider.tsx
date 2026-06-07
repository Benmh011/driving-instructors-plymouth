"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="108" height="56" viewBox="0 0 108 56" fill="none" aria-hidden>
      {/* arch wells */}
      <circle cx="30" cy="45" r="10.5" fill="#d8cfd6" />
      <circle cx="82" cy="45" r="10.5" fill="#d8cfd6" />
      {/* teal body, facing left */}
      <path
        d="M14 47 Q8 47 8 41 L8 36 Q8 31 13 30 L20 29 Q24 12 42 11 L66 11 Q84 12 88 29 L95 30 Q100 31 100 36 L100 41 Q100 47 94 47 Z"
        fill="#2c8aa0"
      />
      {/* windows */}
      <path d="M26 26 L31 15 L48 15 L48 26 Z" fill="#cfe7f0" />
      <path d="M52 26 L52 15 L78 15 Q82 16 82 26 Z" fill="#cfe7f0" />
      {/* wing mirror */}
      <path d="M20 25 L15 26 L15 29 L20 28 Z" fill="#1b2733" />
      {/* door handle */}
      <rect x="64" y="31" width="8" height="2.2" rx="1.1" fill="#1b2733" />
      {/* wheels: tyre, cream rim, hub */}
      <circle cx="30" cy="45" r="9" fill="#14202e" />
      <circle cx="30" cy="45" r="5" fill="#f2efe9" />
      <circle cx="30" cy="45" r="2.2" fill="#14202e" />
      <circle cx="82" cy="45" r="9" fill="#14202e" />
      <circle cx="82" cy="45" r="5" fill="#f2efe9" />
      <circle cx="82" cy="45" r="2.2" fill="#14202e" />
      {/* centred L-plate */}
      <rect x="47" y="30" width="14" height="12" rx="2" fill="#c8362f" />
      <text
        x="54"
        y="40"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11"
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
      <line x1="3" y1="4" x2="3" y2="46" stroke="#7c828a" strokeWidth="2.5" />
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
          setDriven(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // We drive on the left: car faces left, travels right -> left.
  const left = driven ? `calc(${100 - progress}% - 54px)` : "calc(100% + 24px)";

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative h-20 w-full overflow-hidden ${dark ? "bg-tarmac" : "bg-paper"}`}
    >
      {/* asphalt */}
      <div className="absolute inset-x-0 bottom-0 h-7 bg-[#5c626a]">
        <div
          className="absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2"
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
        className="absolute bottom-0.5 w-[108px] transition-[left] duration-[2200ms] ease-out motion-reduce:transition-none"
        style={{ left }}
      >
        <Car />
      </div>
    </div>
  );
}
