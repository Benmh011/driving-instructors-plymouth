"use client";

import { useActionState } from "react";
import { addExpense } from "@/app/dashboard/tax/actions";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function ExpenseForm({
  year,
  defaultDate,
}: {
  year: number;
  defaultDate?: string;
}) {
  const [state, action, pending] = useActionState(
    addExpense.bind(null, year),
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={defaultDate}
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="amount">
            Amount (£)
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            required
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="category">
          Category
        </label>
        <select id="category" name="category" defaultValue="" className={field}>
          <option value="" disabled>
            Choose a category…
          </option>
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="note">
          Note <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="e.g. Fuel for the week, tyre replacement"
          className={field}
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add expense"}
      </button>
    </form>
  );
}
