"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBlockPackage } from "@/app/dashboard/blocks/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function AddBlockForm() {
  const [state, action, pending] = useActionState(createBlockPackage, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful add so the next one starts fresh.
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div>
        <label className={label} htmlFor="name">
          Block name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={60}
          placeholder="e.g. 10-hour block"
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="hours">
            Hours
          </label>
          <input
            id="hours"
            name="hours"
            type="number"
            min="0.5"
            max="100"
            step="0.5"
            required
            placeholder="10"
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="price">
            Price (£)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="280"
            className={field}
          />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm font-medium text-signal">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add block"}
      </button>
    </form>
  );
}
