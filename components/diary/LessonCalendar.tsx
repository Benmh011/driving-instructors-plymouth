"use client";

import { useState } from "react";
import Link from "next/link";
import CancelButton from "./CancelButton";
import CompleteButton from "./CompleteButton";
import PaidButton from "./PaidButton";
import PayButton from "./PayButton";
import ClaimButton from "./ClaimButton";
import RemoveOpenButton from "./RemoveOpenButton";
import UseCreditButton from "./UseCreditButton";
import RefundButtons from "./RefundButtons";

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
  canPay: boolean;
  kind: "lesson" | "open";
  canClaim: boolean;
  refundStatus: string;
  lateCancellation: boolean;
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

function fmtLenWords(m: number) {
  if (m < 60) return `${m} mins`;
  if (m % 60 === 0) {
    const h = m / 60;
    return `${h} hour${h === 1 ? "" : "s"}`;
  }
  return `${(m / 60).toFixed(1)} hours`;
}

// Formatted end time, given a start ISO and a duration in minutes.
function endTime(iso: string, m: number) {
  return fmtTime(new Date(new Date(iso).getTime() + m * 60000).toISOString());
}

type Tone = "open" | "paid" | "unpaid" | "cancelled";

function toneOf(l: CalLesson): Tone {
  if (l.kind === "open") return "open";
  if (l.status === "CANCELLED") return "cancelled";
  return l.paid ? "paid" : "unpaid";
}

const TONE_BORDER: Record<Tone, string> = {
  open: "border-l-line",
  paid: "border-l-go",
  unpaid: "border-l-sea",
  cancelled: "border-l-ink/20",
};

const TONE_DOT: Record<Tone, string> = {
  open: "bg-line",
  paid: "bg-go",
  unpaid: "bg-sea",
  cancelled: "bg-ink/30",
};

export default function LessonCalendar({
  lessons,
  isInstructor,
  readOnly = false,
  selectedKey,
  onSelectDay,
  creditMinutes = 0,
}: {
  lessons: CalLesson[];
  isInstructor: boolean;
  readOnly?: boolean;
  selectedKey?: string;
  onSelectDay?: (k: string) => void;
  creditMinutes?: number;
}) {
  const today = new Date();
  const [viewY, setViewY] = useState(today.getUTCFullYear());
  const [viewM, setViewM] = useState(today.getUTCMonth());
  // The selected day can be controlled by a parent (so the booking form can
  // default its date to it) or managed internally when used standalone.
  const [internalSel, setInternalSel] = useState(
    key(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  const selKey = selectedKey ?? internalSel;
  const setSelKey = (k: string) => {
    if (onSelectDay) onSelectDay(k);
    else setInternalSel(k);
  };

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
            const dayLessons = byDay[k] ?? [];
            const dayTones = (["open", "unpaid", "paid"] as Tone[]).filter((t) =>
              dayLessons.some((l) => toneOf(l) === t),
            );
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
                {dayTones.length > 0 && (
                  <span className="absolute bottom-1 flex gap-0.5">
                    {dayTones.map((t) => (
                      <span
                        key={t}
                        className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[t]} ${
                          isSel ? "ring-1 ring-white" : ""
                        }`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-line" /> Available to claim
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sea" /> Booked / unpaid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-go" /> Paid
        </span>
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
              const isOpen = l.kind === "open";
              return (
                <li
                  key={l.id}
                  className={`rounded-2xl border border-hairline border-l-4 bg-cream p-5 shadow-sm ${TONE_BORDER[toneOf(l)]}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {fmtTime(l.start)} – {endTime(l.start, l.durationMins)}{" "}
                        <span className="font-normal text-ink-soft">
                          ({fmtLenWords(l.durationMins)})
                        </span>
                        {l.pricePence != null && (
                          <span className="text-ink-soft">
                            {" "}
                            &middot; £{(l.pricePence / 100).toFixed(2)}
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {isOpen ? (
                          <span className="font-semibold text-ink">
                            Available to claim
                          </span>
                        ) : (
                          <>
                            {l.other}
                            {l.status === "CANCELLED" && " · cancelled"}
                            {completed && " · completed"}
                          </>
                        )}
                      </p>
                      {l.notes && (
                        <p className="mt-2 text-sm text-ink">{l.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      {isOpen ? (
                        <>
                          {l.canClaim && <ClaimButton id={l.id} />}
                          {isInstructor && !readOnly && (
                            <RemoveOpenButton id={l.id} />
                          )}
                        </>
                      ) : (
                        <>
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
                          {!isInstructor &&
                            l.status !== "CANCELLED" &&
                            (l.paid ? (
                              <span className="shrink-0 rounded-full bg-go/15 px-3.5 py-1.5 text-sm font-semibold text-go">
                                Paid ✓
                              </span>
                            ) : (
                              <>
                                {creditMinutes >= l.durationMins && (
                                  <UseCreditButton
                                    id={l.id}
                                    label={`Use ${fmtLenWords(l.durationMins)} credit`}
                                  />
                                )}
                                {l.canPay && l.pricePence != null && (
                                  <PayButton id={l.id} pricePence={l.pricePence} />
                                )}
                              </>
                            ))}
                          {cancellable && !readOnly && (
                            <CancelButton id={l.id} confirmText={confirmText} />
                          )}
                          {l.status === "CANCELLED" &&
                            l.refundStatus === "PENDING" &&
                            (isInstructor && !readOnly ? (
                              <RefundButtons
                                id={l.id}
                                late={l.lateCancellation}
                              />
                            ) : (
                              <span className="shrink-0 rounded-full bg-line/15 px-3.5 py-1.5 text-sm font-semibold text-ink-soft">
                                Refund pending
                              </span>
                            ))}
                          {l.status === "CANCELLED" &&
                            l.refundStatus === "REFUNDED" && (
                              <span className="shrink-0 rounded-full bg-go/15 px-3.5 py-1.5 text-sm font-semibold text-go">
                                Refunded
                              </span>
                            )}
                          {l.status === "CANCELLED" &&
                            l.refundStatus === "DECLINED" && (
                              <span className="shrink-0 rounded-full bg-ink/10 px-3.5 py-1.5 text-sm font-semibold text-ink-soft">
                                No refund
                              </span>
                            )}
                        </>
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
