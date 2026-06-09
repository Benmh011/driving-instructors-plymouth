"use client";

import { useState } from "react";
import DeleteExpenseButton from "./DeleteExpenseButton";

type CalLesson = { start: string; pricePence: number; name: string };
type CalExpense = {
  id: string;
  date: string;
  category: string;
  amountPence: number;
  note: string | null;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const key = (y: number, m: number, d: number) => `${y}-${m}-${d}`;

function dayKeyFromIso(iso: string) {
  const d = new Date(iso);
  return key(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function money(pence: number) {
  const sign = pence < 0 ? "\u2212" : "";
  return `${sign}\u00a3${(Math.abs(pence) / 100).toFixed(2)}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export default function TaxCalendar({
  lessons,
  expenses,
}: {
  lessons: CalLesson[];
  expenses: CalExpense[];
}) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewY, setViewY] = useState(today.getUTCFullYear());
  const [viewM, setViewM] = useState(today.getUTCMonth());
  const [selKey, setSelKey] = useState(
    key(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  const incomeByDay: Record<string, CalLesson[]> = {};
  for (const l of lessons) (incomeByDay[dayKeyFromIso(l.start)] ??= []).push(l);
  const expenseByDay: Record<string, CalExpense[]> = {};
  for (const e of expenses) (expenseByDay[dayKeyFromIso(e.date)] ??= []).push(e);

  const firstDow = (new Date(Date.UTC(viewY, viewM, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(viewY, viewM + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewM === 0) {
      setViewY(viewY - 1);
      setViewM(11);
    } else setViewM(viewM - 1);
  }
  function nextMonth() {
    if (viewM === 11) {
      setViewY(viewY + 1);
      setViewM(0);
    } else setViewM(viewM + 1);
  }

  const todayKey = key(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const [sy, sm, sd] = selKey.split("-").map(Number);
  const selLabel = new Date(Date.UTC(sy, sm, sd)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const dayLessons = (incomeByDay[selKey] ?? [])
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start));
  const dayExpenses = (expenseByDay[selKey] ?? [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const dayIncome = dayLessons.reduce((s, l) => s + l.pricePence, 0);
  const dayExpenseTotal = dayExpenses.reduce((s, e) => s + e.amountPence, 0);
  const dayNet = dayIncome - dayExpenseTotal;

  const navBtn =
    "grid h-9 w-9 place-items-center rounded-full text-xl text-cream/80 transition-colors hover:bg-white/10";

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-hairline bg-cream px-5 py-4 text-left transition-colors hover:border-ink/30"
      >
        <span className="font-display text-lg font-semibold">Browse by day</span>
        <span
          className={`text-2xl text-ink-soft transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden
        >
          &rsaquo;
        </span>
      </button>

      {open && (
        <div className="mt-4">
          <div className="overflow-hidden rounded-2xl border border-hairline bg-cream">
            <div className="flex items-center justify-between bg-tarmac px-5 py-4 text-cream">
              <button type="button" onClick={prevMonth} className={navBtn} aria-label="Previous month">
                &lsaquo;
              </button>
              <p className="font-display text-lg font-semibold">
                {MONTHS[viewM]} {viewY}
              </p>
              <button type="button" onClick={nextMonth} className={navBtn} aria-label="Next month">
                &rsaquo;
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {WEEKDAYS.map((w) => (
                  <div key={w}>{w}</div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((d, idx) => {
                  if (d === null) return <div key={idx} />;
                  const k = key(viewY, viewM, d);
                  const hasIncome = (incomeByDay[k]?.length ?? 0) > 0;
                  const hasExpense = (expenseByDay[k]?.length ?? 0) > 0;
                  const isSel = k === selKey;
                  const isToday = k === todayKey;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelKey(k)}
                      className={`relative grid aspect-square place-items-center rounded-lg border border-sea/40 text-sm transition-colors ${
                        isSel
                          ? "bg-sea font-semibold text-white"
                          : isToday
                            ? "bg-sea/10 font-semibold"
                            : "hover:bg-sea/10"
                      }`}
                    >
                      {d}
                      {(hasIncome || hasExpense) && (
                        <span className="absolute bottom-1 flex gap-0.5">
                          {hasIncome && (
                            <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white" : "bg-go"}`} />
                          )}
                          {hasExpense && (
                            <span className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white" : "bg-signal"}`} />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex gap-4 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-go" /> income
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-signal" /> expense
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-semibold">{selLabel}</h3>
              <p className="text-sm text-ink-soft">
                Net{" "}
                <span className={`font-semibold ${dayNet < 0 ? "text-signal" : "text-go"}`}>
                  {money(dayNet)}
                </span>
              </p>
            </div>

            {dayLessons.length === 0 && dayExpenses.length === 0 ? (
              <p className="mt-2 text-[15px] text-ink-soft">Nothing recorded this day.</p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {dayLessons.map((l, i) => (
                  <div
                    key={`l${i}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-hairline border-l-4 border-l-go bg-cream p-4"
                  >
                    <span className="text-[15px]">
                      {fmtTime(l.start)} &middot; lesson with {l.name}
                    </span>
                    <span className="shrink-0 font-semibold text-go">+{money(l.pricePence)}</span>
                  </div>
                ))}
                {dayExpenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-hairline border-l-4 border-l-signal bg-cream p-4"
                  >
                    <span className="min-w-0 text-[15px]">
                      {e.category}
                      {e.note ? <span className="text-ink-soft"> · {e.note}</span> : null}
                    </span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold text-signal">&minus;{money(e.amountPence)}</span>
                      <DeleteExpenseButton id={e.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
