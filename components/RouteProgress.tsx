"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// A slim top bar that appears the moment you click an internal link and sweeps
// to full as the new page lands — so a slow navigation never feels like a dead
// press. Disabled for reduced-motion users (handled in CSS).
export function RouteProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const loadingRef = useRef(false);

  // Path changed → if we were mid-navigation, finish the bar.
  useEffect(() => {
    if (!loadingRef.current) return;
    loadingRef.current = false;
    setPhase("done");
    const t = setTimeout(() => setPhase("idle"), 400);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a") as
        | HTMLAnchorElement
        | null;
      if (!anchor) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href") || "";
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;
      if (anchor.origin !== window.location.origin) return;
      if (
        anchor.pathname === window.location.pathname &&
        anchor.search === window.location.search
      )
        return;
      loadingRef.current = true;
      setPhase("loading");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Safety net: never let the bar hang indefinitely.
  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => {
      loadingRef.current = false;
      setPhase("idle");
    }, 12000);
    return () => clearTimeout(t);
  }, [phase]);

  const cls =
    phase === "loading"
      ? "route-progress--on"
      : phase === "done"
        ? "route-progress--done"
        : "";

  return <div aria-hidden className={`route-progress ${cls}`} />;
}
