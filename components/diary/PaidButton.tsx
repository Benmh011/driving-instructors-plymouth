"use client";

import { useTransition } from "react";
import { setLessonPaid } from "@/app/diary/actions";

export default function PaidButton({ id, paid }: { id: string; paid: boolean }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(() => {
      setLessonPaid(id, !paid);
    });
  }

  if (paid) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        title="Mark as unpaid"
        className="shrink-0 rounded-full bg-go/15 px-3.5 py-1.5 text-sm font-semibold text-go transition-colors hover:bg-go/25 disabled:opacity-50"
      >
        {pending ? "…" : "Paid ✓"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="shrink-0 rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-go hover:text-go disabled:opacity-50"
    >
      {pending ? "…" : "Mark paid"}
    </button>
  );
}
