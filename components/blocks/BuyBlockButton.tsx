"use client";

import { useState } from "react";
import { buyBlock } from "@/app/credit/actions";

export default function BuyBlockButton({
  packageId,
  label,
}: {
  packageId: string;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setError("");
    setPending(true);
    const res = await buyBlock(packageId);
    if (res.url) {
      window.location.href = res.url;
      return;
    }
    setError(res.error ?? "Something went wrong.");
    setPending(false);
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-50 press"
      >
        {pending ? "Starting…" : label}
      </button>
      {error && (
        <span className="max-w-[14rem] text-right text-xs font-medium text-signal">
          {error}
        </span>
      )}
    </div>
  );
}
