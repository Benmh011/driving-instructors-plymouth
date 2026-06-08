"use client";

import { useActionState } from "react";
import { createLesson } from "@/app/diary/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function BookLessonForm({
  roster,
}: {
  roster: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createLesson, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={label} htmlFor="learnerId">
          Student
        </label>
        <select id="learnerId" name="learnerId" className={field} defaultValue="">
          <option value="" disabled>
            Choose a student…
          </option>
          {roster.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="start">
            Date &amp; time
          </label>
          <input id="start" name="start" type="datetime-local" required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="durationMins">
            Length
          </label>
          <select id="durationMins" name="durationMins" defaultValue="60" className={field}>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
            <option value="45">45 minutes</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="price">
          Price (£) <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="Leave blank to use your hourly rate"
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="notes">
          Notes <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="notes"
          name="notes"
          type="text"
          placeholder="e.g. Manoeuvres practice, pick up from home"
          className={field}
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Booking…" : "Book lesson"}
      </button>
    </form>
  );
}
