"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// A lightweight pull-to-refresh for touch devices: drag down from the very top
// of the page and release past the threshold to refresh the current view.
// Desktop (no touch) is unaffected.
const THRESHOLD = 70;

export default function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, startRefresh] = useTransition();
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    function onStart(e: TouchEvent) {
      startY.current =
        window.scrollY <= 0 && e.touches.length === 1
          ? e.touches[0].clientY
          : null;
    }
    function onMove(e: TouchEvent) {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && window.scrollY <= 0) {
        const dist = Math.min(dy * 0.5, 120); // a little resistance
        pullRef.current = dist;
        setPull(dist);
        if (dist > 5) e.preventDefault(); // hold off native scroll/overscroll
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    }
    function onEnd() {
      if (startY.current === null) return;
      if (pullRef.current > THRESHOLD) {
        startRefresh(() => router.refresh());
      }
      pullRef.current = 0;
      setPull(0);
      startY.current = null;
    }
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [router]);

  if (pull <= 0 && !refreshing) return null;

  const spin = refreshing || pull > THRESHOLD;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex justify-center"
      style={{ transform: `translateY(${refreshing ? 16 : pull - 8}px)` }}
    >
      <div className="mt-1 grid h-9 w-9 place-items-center rounded-full bg-cream shadow-md ring-1 ring-ink/10">
        <div
          className={`h-5 w-5 rounded-full border-2 border-ink/20 border-t-sea ${
            spin ? "animate-spin" : ""
          }`}
          style={spin ? undefined : { transform: `rotate(${pull * 3}deg)` }}
        />
      </div>
    </div>
  );
}
