"use client";

import { useActionState, useEffect, useState } from "react";
import { createLesson } from "@/app/diary/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

// dayKey is "YYYY-M-D" with a 0-indexed month (as the calendar produces it).
// Convert to the "YYYY-MM-DD" a datetime-local input expects.
function dayKeyToDate(dayKey?: string): string {
  if (dayKey) {
    const [y, m, d] = dayKey.split("-").map(Number);
    if (![y, m, d].some(Number.isNaN)) {
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate(),
  ).padStart(2, "0")}`;
}

export default function BookLessonForm({
  roster,
  selectedDayKey,
}: {
  roster: { id: string; name: string }[];
  selectedDayKey?: string;
}) {
  const [state, action, pending] = useActionState(createLesson, undefined);
  const [start, setStart] = useState(() => `${dayKeyToDate(selectedDayKey)}T09:00`);

  // Follow whichever day the instructor selects in the calendar, keeping any
  // time they've already set.
  useEffect(() => {
    setStart((prev) => {
      const time = prev.split("T")[1] || "09:00";
      return `${dayKeyToDate(selectedDayKey)}T${time}`;
    });
  }, [selectedDayKey]);

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
          <input
            id="start"
            name="start"
            type="datetime-local"
            step={300}
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={field}
          />
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
