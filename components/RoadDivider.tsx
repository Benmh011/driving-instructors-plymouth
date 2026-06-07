"use client";

import { useEffect, useRef, useState } from "react";

function Car() {
  return (
    <svg width="100" height="58" viewBox="0 0 100 58" fill="none" aria-hidden>
      {/* teal body, facing left */}
      <path
        d="M12 47 Q8 47 8 41 L8 35 Q8 28 15 25 Q19 10 42 9 L58 9 Q81 10 85 25 Q92 28 92 35 L92 41 Q92 47 86 47 Z"
        fill="#2c8aa0"
      />
      {/* grey wheel arches */}
      <circle cx="28" cy="45" r="10.5" fill="#a9aeb4" />
      <circle cx="72" cy="45" r="10.5" fill="#a9aeb4" />
      {/* grey lower skirt */}
      <path
        d="M8 40 L92 40 L92 41 Q92 47 86 47 L12 47 Q8 47 8 41 Z"
        fill="#a9aeb4"
      />
      {/* tyres + hubs */}
      <circle cx="28" cy="45" r="8" fill="#14202e" />
      <circle cx="28" cy="45" r="3.2" fill="#d7dbde" />
      <circle cx="72" cy="45" r="8" fill="#14202e" />
      <circle cx="72" cy="45" r="3.2" fill="#d7dbde" />
      {/* domed window */}
      <path d="M20 24 Q22 13 40 12 L56 12 Q74 13 78 24 Z" fill="#d4ecf2" />
      <path
        d="M30 23 L40 13.5 L46 13.5 L36 23 Z"
        fill="#ffffff"
        opacity="0.55"
      />
      <path d="M50 23 L57 14 L61 14.5 L54 23 Z" fill="#ffffff" opacity="0.45" />
      {/* centred L-plate */}
      <rect x="43" y="28" width="14" height="12" rx="2" fill="#c8362f" />
      <text
        x="50"
        y="38"
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

  // We drive on the left: car faces left, travels right -> left.
  // Higher progress = further along = further to the left.
  const left = driven ? `calc(${100 - progress}% - 50px)` : "calc(100% + 24px)";

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
        className="absolute bottom-0.5 w-[100px] transition-[left] duration-[2200ms] ease-out motion-reduce:transition-none"
        style={{ left }}
      >
        <Car />
      </div>
    </div>
  );
}
