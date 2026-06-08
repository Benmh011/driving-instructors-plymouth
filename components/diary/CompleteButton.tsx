"use client";

import { useTransition } from "react";
import { markLessonComplete, reopenLesson } from "@/app/diary/actions";

export default function CompleteButton({
  id,
  mode,
}: {
  id: string;
  mode: "complete" | "reopen";
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(() => {
      if (mode === "complete") markLessonComplete(id);
      else reopenLesson(id);
    });
  }

  if (mode === "complete") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="shrink-0 rounded-full bg-go px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Mark complete"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="shrink-0 rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50"
    >
      {pending ? "…" : "Reopen"}
    </button>
  );
}
