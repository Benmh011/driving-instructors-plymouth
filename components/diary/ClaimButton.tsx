"use client";

import { useState } from "react";
import { claimOpenLesson } from "@/app/diary/actions";

export default function ClaimButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setPending(true);
    const res = await claimOpenLesson(id);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // On success the action revalidates the diary, so this card re-renders as a
    // booked lesson — keep the spinner up until that happens.
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-full bg-line px-3.5 py-1.5 text-sm font-semibold text-tarmac transition-colors hover:bg-line/80 disabled:opacity-50 press"
      >
        {pending ? "…" : "Claim lesson"}
      </button>
      {error && (
        <span className="max-w-[12rem] text-right text-xs font-medium text-signal">
          {error}
        </span>
      )}
    </div>
  );
}
