"use client";

import { useState, useTransition } from "react";
import { refundAllCredit } from "@/app/dashboard/credit/actions";

export default function RefundAllCreditButton({ count }: { count: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function onClick() {
    const plural = count === 1 ? "" : "s";
    if (
      !window.confirm(
        `Refund unused hours for all ${count} student${plural}? This refunds to their cards and can't be undone.`,
      )
    ) {
      return;
    }
    setError("");
    setDone("");
    startTransition(async () => {
      const res = await refundAllCredit();
      if (res?.error) setError(res.error);
      else {
        const n = res?.students ?? 0;
        setDone(`Refunded ${n} student${n === 1 ? "" : "s"}.`);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="self-start rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-signal/90 disabled:opacity-50 press"
      >
        {pending ? "Refunding…" : "Refund everyone"}
      </button>
      {error && <span className="text-xs font-medium text-signal">{error}</span>}
      {done && <span className="text-xs font-medium text-go">{done}</span>}
    </div>
  );
}
