"use client";

import { useState, useTransition } from "react";
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

  function onCancel() {
    if (!window.confirm(confirmText)) return;
    setDone(true);
    startTransition(() => {
      cancelLesson(id);
    });
  }

  return (
    <button
      type="button"
      onClick={onCancel}
      disabled={pending || done}
      className="shrink-0 rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
    >
      {pending || done ? "Cancelling…" : "Cancel"}
    </button>
  );
}
