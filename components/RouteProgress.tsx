"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// A slim top bar that appears the moment you click an internal link and clears
// once the new page is on screen — so a slow navigation never feels like a
// dead press. No-ops for users with reduced motion (handled in CSS).
export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // Navigation finished (pathname changed) → clear.
  useEffect(() => {
    setActive(false);
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
      // Same page (just a hash / identical path) → no navigation.
      if (
        anchor.pathname === window.location.pathname &&
        anchor.search === window.location.search
      )
        return;
      setActive(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Safety net: never let the bar hang indefinitely.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 12000);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div aria-hidden className={`route-progress ${active ? "route-progress--on" : ""}`} />
  );
}
