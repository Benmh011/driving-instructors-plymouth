"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="96" height="52" viewBox="0 0 96 52" fill="none" aria-hidden>
      {/* wheels (body overlaps tops for an arch) */}
      <circle cx="26" cy="41" r="8" fill="#14202e" />
      <circle cx="26" cy="41" r="3.2" fill="#c9cdca" />
      <circle cx="72" cy="41" r="8" fill="#14202e" />
      <circle cx="72" cy="41" r="3.2" fill="#c9cdca" />
      {/* rounded body, facing left */}
      <path
        d="M14 42 Q8 42 8 36 L8 31 Q9 24 16 22 Q22 9 38 8 L60 8 Q78 9 82 24 L84 30 Q90 31 90 36 L90 39 Q90 42 84 42 Z"
        fill="#2c8aa0"
      />
      {/* windows */}
      <path d="M22 21 L28 11 L42 11 L42 21 Z" fill="#dcecef" />
      <path d="M46 21 L46 11 L62 11 Q74 12 76 21 Z" fill="#dcecef" />
      {/* headlight (front / left) */}
      <circle cx="10" cy="31" r="2" fill="#ffe6a3" />
      {/* rear L-plate (right) */}
      <rect x="74" y="28" width="13" height="11" rx="2" fill="#c8362f" />
      <text
        x="80.5"
        y="37"
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

  // We drive on the left: the car faces left and travels right -> left.
  // Higher progress = further along = further to the left.
  const left = driven ? `calc(${100 - progress}% - 48px)` : "calc(100% + 24px)";

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative h-20 w-full overflow-hidden bg-paper"
    >
      {/* asphalt */}
      <div className="absolute inset-x-0 bottom-0 h-6 bg-[#5c626a]">
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
        className="absolute bottom-2 w-[96px] transition-[left] duration-[2200ms] ease-out motion-reduce:transition-none"
        style={{ left }}
      >
        <Car />
      </div>
    </div>
  );
}
