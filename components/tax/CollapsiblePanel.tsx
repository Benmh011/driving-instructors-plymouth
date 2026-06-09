"use client";

import { useState, type ReactNode } from "react";

export default function CollapsiblePanel({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-9">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-hairline bg-cream px-5 py-4 text-left transition-colors hover:border-ink/30"
      >
        <span className="font-display text-lg font-semibold">{title}</span>
        <span
          className={`text-2xl text-ink-soft transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden
        >
          &rsaquo;
        </span>
      </button>
      {open && (
        <div className="mt-4 rounded-2xl border border-hairline bg-cream p-6">
          {children}
        </div>
      )}
    </div>
  );
}
