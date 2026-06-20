"use client";

import { useState } from "react";
import { coverLessonWithCredit } from "@/app/diary/actions";

export default function UseCreditButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setPending(true);
    const res = await coverLessonWithCredit(id);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // On success the diary revalidates and this lesson re-renders as paid.
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-full border border-sea px-3.5 py-1.5 text-sm font-semibold text-sea transition-colors hover:bg-sea hover:text-white disabled:opacity-50 press"
      >
        {pending ? "…" : label}
      </button>
      {error && (
        <span className="max-w-[12rem] text-right text-xs font-medium text-signal">
          {error}
        </span>
      )}
    </div>
  );
}
