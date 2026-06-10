"use client";

import { useState } from "react";
import Link from "next/link";
import CancelButton from "./CancelButton";
import CompleteButton from "./CompleteButton";
import PaidButton from "./PaidButton";

export type CalLesson = {
  id: string;
  start: string; // ISO
  durationMins: number;
  status: string;
  other: string;
  notes: string | null;
  noticeHours: number;
  paid: boolean;
  pricePence: number | null;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const key = (y: number, m: number, d: number) => `${y}-${m}-${d}`;

function startKey(iso: string) {
  const d = new Date(iso);
  return key(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

function fmtLen(m: number) {
  return m % 60 === 0 ? `${m / 60} hr${m === 60 ? "" : "s"}` : `${m} min`;
}

export default function LessonCalendar({
  lessons,
  isInstructor,
  readOnly = false,
}: {
  lessons: CalLesson[];
  isInstructor: boolean;
  readOnly?: boolean;
}) {
  const today = new Date();
  const [viewY, setViewY] = useState(today.getUTCFullYear());
  const [viewM, setViewM] = useState(today.getUTCMonth());
  const [selKey, setSelKey] = useState(
    key(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  const byDay: Record<string, CalLesson[]> = {};
  for (const l of lessons) {
    const k = startKey(l.start);
    (byDay[k] ??= []).push(l);
  }

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
    timeZone: "UTC",
  });
  const selLessons = (byDay[selKey] ?? [])
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start));

  const navBtn =
    "grid h-9 w-9 place-items-center rounded-full text-xl text-cream/80 transition-colors hover:bg-white/10";

  return (
    <div>
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
            const has = (byDay[k]?.length ?? 0) > 0;
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
                {has && (
                  <span
                    className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${
                      isSel ? "bg-white" : "bg-sea"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-lg font-semibold">{selLabel}</h3>
        {selLessons.length === 0 ? (
          <p className="mt-2 text-[15px] text-ink-soft">No lessons this day.</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {selLessons.map((l) => {
              const upcoming = new Date(l.start) >= new Date();
              const cancellable = l.status === "BOOKED" && upcoming;
              const completable =
                isInstructor && l.status === "BOOKED" && !upcoming && !readOnly;
              const completed = l.status === "COMPLETED";
              const editable =
                isInstructor && l.status !== "CANCELLED" && !readOnly;
              const late =
                (new Date(l.start).getTime() - Date.now()) / 3_600_000 <
                l.noticeHours;
              const confirmText = late
                ? `This lesson is inside the ${l.noticeHours}-hour notice window. Cancel it anyway?`
                : "Cancel this lesson?";
              return (
                <li
                  key={l.id}
                  className={`rounded-2xl border border-hairline border-l-4 bg-cream p-5 shadow-sm ${
                    completed ? "border-l-go" : "border-l-sea"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {fmtTime(l.start)} &middot; {fmtLen(l.durationMins)}
                        {l.pricePence != null && (
                          <span className="text-ink-soft">
                            {" "}
                            &middot; £{(l.pricePence / 100).toFixed(2)}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {l.other}
                        {l.status === "CANCELLED" && " · cancelled"}
                        {completed && " · completed"}
                      </p>
                      {l.notes && (
                        <p className="mt-2 text-sm text-ink">{l.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      {editable && (
                        <Link
                          href={`/diary/${l.id}/edit`}
                          className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink"
                        >
                          Edit
                        </Link>
                      )}
                      {completable && <CompleteButton id={l.id} mode="complete" />}
                      {completed && isInstructor && !readOnly && (
                        <CompleteButton id={l.id} mode="reopen" />
                      )}
                      {isInstructor && l.status !== "CANCELLED" && !readOnly && (
                        <PaidButton id={l.id} paid={l.paid} />
                      )}
                      {cancellable && !readOnly && (
                        <CancelButton id={l.id} confirmText={confirmText} />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
