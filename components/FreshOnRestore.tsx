"use client";

import { useEffect } from "react";

// When the browser restores a page from its back/forward (bfcache) — e.g. after
// switching accounts in the same tab and pressing Back — the restored snapshot
// can show a previous session's view. Reloading on a persisted restore forces a
// fresh render for whoever is signed in now.
export default function FreshOnRestore() {
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
