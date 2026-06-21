"use client";

import { useState, useTransition } from "react";
import { refundStudentCredit } from "@/app/dashboard/credit/actions";

export default function RefundCreditButton({
  learnerId,
  amountLabel,
}: {
  learnerId: string;
  amountLabel: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function onClick() {
    const msg = amountLabel
      ? `Refund ${amountLabel} of unused hours to this student's card? This can't be undone.`
      : `Clear this student's unused hours? This can't be undone.`;
    if (!window.confirm(msg)) return;
    setError("");
    startTransition(async () => {
      const res = await refundStudentCredit(learnerId);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-full bg-go px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-go/90 disabled:opacity-50 press"
      >
        {pending ? "…" : "Refund"}
      </button>
      {error && (
        <span className="max-w-[12rem] text-right text-xs font-medium text-signal">
          {error}
        </span>
      )}
    </div>
  );
}
