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

// Hours 00–23 and minutes in clean 5-minute steps. A native datetime picker
// won't reliably restrict the selection to 5s, so we offer explicit dropdowns.
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export default function BookLessonForm({
  roster,
  selectedDayKey,
}: {
  roster: { id: string; name: string }[];
  selectedDayKey?: string;
}) {
  const [state, action, pending] = useActionState(createLesson, undefined);
  const [dateStr, setDateStr] = useState(() => dayKeyToDate(selectedDayKey));
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [leaveOpen, setLeaveOpen] = useState(false);

  // Follow whichever day the instructor selects in the calendar.
  useEffect(() => {
    setDateStr(dayKeyToDate(selectedDayKey));
  }, [selectedDayKey]);

  const start = `${dateStr}T${hour}:${minute}`;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={label} htmlFor="learnerId">
          Student
        </label>
        <select
          id="learnerId"
          name="learnerId"
          className={`${field} disabled:opacity-50`}
          defaultValue=""
          disabled={leaveOpen}
        >
          <option value="" disabled>
            Choose a student…
          </option>
          {roster.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <label className="mt-2.5 flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            name="leaveOpen"
            checked={leaveOpen}
            onChange={(e) => setLeaveOpen(e.target.checked)}
            className="h-4 w-4 accent-sea"
          />
          Leave open for any of your students to claim
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            required
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
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
        <label className={label} htmlFor="hour">
          Time
        </label>
        <div className="flex items-center gap-2">
          <select
            id="hour"
            aria-label="Hour"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className={field}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className="text-lg font-semibold text-ink-soft">:</span>
          <select
            aria-label="Minute"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className={field}
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input type="hidden" name="start" value={start} />

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
        {pending
          ? leaveOpen
            ? "Posting…"
            : "Booking…"
          : leaveOpen
            ? "Post open lesson"
            : "Book lesson"}
      </button>
    </form>
  );
}
