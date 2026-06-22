"use client";

import { useActionState } from "react";
import { updateOpenLesson } from "@/app/diary/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

const DURATIONS = [
  { v: "30", l: "30 minutes" },
  { v: "45", l: "45 minutes" },
  { v: "60", l: "1 hour" },
  { v: "90", l: "1.5 hours" },
  { v: "120", l: "2 hours" },
];

export default function EditOpenLessonForm({
  id,
  defaultStart,
  defaultDuration,
  defaultPrice,
  defaultNotes,
}: {
  id: string;
  defaultStart: string;
  defaultDuration: number;
  defaultPrice: number;
  defaultNotes: string;
}) {
  const [state, action, pending] = useActionState(
    updateOpenLesson.bind(null, id),
    undefined,
  );

  const durationValue = DURATIONS.some((d) => d.v === String(defaultDuration))
    ? String(defaultDuration)
    : "60";

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="start">
            Date &amp; time
          </label>
          <input
            id="start"
            name="start"
            type="datetime-local"
            defaultValue={defaultStart}
            required
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor="durationMins">
            Length
          </label>
          <select
            id="durationMins"
            name="durationMins"
            defaultValue={durationValue}
            className={field}
          >
            {DURATIONS.map((d) => (
              <option key={d.v} value={d.v}>
                {d.l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="price">
          Price (£)
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultPrice || ""}
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">
          Leave blank to use your hourly rate for this length.
        </p>
      </div>

      <div>
        <label className={label} htmlFor="notes">
          Notes <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultNotes}
          placeholder="Anything students should know about this slot…"
          className={`${field} resize-y`}
        />
      </div>

      {state?.error && (
        <p className="text-sm font-medium text-signal">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
