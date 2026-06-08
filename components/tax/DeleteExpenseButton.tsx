"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/app/dashboard/tax/actions";

export default function DeleteExpenseButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Delete this expense?")) {
          startTransition(() => deleteExpense(id));
        }
      }}
      disabled={pending}
      className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
