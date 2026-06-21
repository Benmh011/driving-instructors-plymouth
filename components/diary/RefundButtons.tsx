"use client";

import { useState } from "react";
import { approveRefund, declineRefund } from "@/app/diary/actions";

export default function RefundButtons({
  id,
  late,
}: {
  id: string;
  late: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function run(fn: (id: string) => Promise<{ error?: string }>) {
    setError("");
    setPending(true);
    const res = await fn(id);
    if (res?.error) {
      setError(res.error);
      setPending(false);
    }
    // On success the diary revalidates and the lesson re-renders with its new
    // refund status.
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5">
      {late && (
        <span className="rounded-full bg-line/20 px-2.5 py-0.5 text-xs font-semibold text-ink">
          Late cancellation
        </span>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => run(approveRefund)}
          disabled={pending}
          className="rounded-full bg-go px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-go/90 disabled:opacity-50 press"
        >
          {pending ? "…" : "Refund"}
        </button>
        <button
          type="button"
          onClick={() => run(declineRefund)}
          disabled={pending}
          className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
        >
          Decline
        </button>
      </div>
      {error && (
        <span className="max-w-[12rem] text-right text-xs font-medium text-signal">
          {error}
        </span>
      )}
    </div>
  );
}
