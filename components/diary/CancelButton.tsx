"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { cancelLesson } from "@/app/diary/actions";

export default function CancelButton({
  id,
  confirmText,
}: {
  id: string;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close on Escape while the dialog is open.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function confirmCancel() {
    setOpen(false);
    setDone(true);
    startTransition(() => {
      cancelLesson(id);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending || done}
        className="shrink-0 rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
      >
        {pending || done ? "Cancelling…" : "Cancel"}
      </button>

      {mounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div className="relative w-full max-w-sm rounded-2xl border border-hairline bg-cream p-6 shadow-xl">
                <p className="font-display text-lg font-semibold text-ink">
                  Cancel this lesson?
                </p>
                <p className="mt-2 text-[15px] text-ink-soft">{confirmText}</p>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full border border-ink/20 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
                  >
                    Keep lesson
                  </button>
                  <button
                    type="button"
                    onClick={confirmCancel}
                    className="flex-1 rounded-full bg-signal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-signal-dark"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
