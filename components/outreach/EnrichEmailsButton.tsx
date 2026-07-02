"use client";

import { useState, useTransition } from "react";
import { enrichEmails } from "@/app/admin/outreach/actions";

export default function EnrichEmailsButton({ count }: { count: number }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function run() {
    setError("");
    setMsg("");
    startTransition(async () => {
      const res = await enrichEmails();
      if (res?.error) {
        setError(res.error);
        return;
      }
      const found = res?.found ?? 0;
      const checked = res?.checked ?? 0;
      const remaining = res?.remaining ?? 0;
      setMsg(
        `Checked ${checked}, found ${found}${
          remaining > 0 ? ` · ${remaining} still to try` : ""
        }.`,
      );
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={run}
        disabled={pending || count === 0}
        className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-line/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending
          ? "Scanning websites…"
          : `Find emails from websites${count > 0 ? ` (${count})` : ""}`}
      </button>
      {msg && <span className="text-xs font-medium text-go">{msg}</span>}
      {error && <span className="text-xs font-medium text-signal">{error}</span>}
    </div>
  );
}
