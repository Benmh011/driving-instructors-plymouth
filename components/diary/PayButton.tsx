"use client";

import { useState } from "react";
import { payForLesson } from "@/app/diary/actions";

export default function PayButton({
  id,
  pricePence,
}: {
  id: string;
  pricePence: number;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setPending(true);
    const res = await payForLesson(id);
    if (res.url) {
      window.location.href = res.url; // off to Stripe Checkout
      return; // keep the spinner up while the browser navigates
    }
    setError(res.error ?? "Something went wrong. Please try again.");
    setPending(false);
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-full bg-sea px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-50 press"
      >
        {pending ? "…" : `Pay £${(pricePence / 100).toFixed(2)}`}
      </button>
      {error && (
        <span className="max-w-[12rem] text-right text-xs font-medium text-signal">
          {error}
        </span>
      )}
    </div>
  );
}
