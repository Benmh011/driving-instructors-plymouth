"use client";

import { useState } from "react";
import Link from "next/link";
import LessonCalendar, { type CalLesson } from "./LessonCalendar";
import BookLessonForm from "./BookLessonForm";

function todayKey() {
  const t = new Date();
  return `${t.getUTCFullYear()}-${t.getUTCMonth()}-${t.getUTCDate()}`;
}

// Active-instructor diary: the calendar and the booking form share a selected
// day, so the form's date follows whichever day is picked in the calendar.
export default function InstructorDiary({
  lessons,
  roster,
}: {
  lessons: CalLesson[];
  roster: { id: string; name: string }[];
}) {
  const [selKey, setSelKey] = useState(todayKey());

  return (
    <>
      <div className="mt-9">
        <LessonCalendar
          lessons={lessons}
          isInstructor
          selectedKey={selKey}
          onSelectDay={setSelKey}
        />
      </div>

      <section className="mt-9 rounded-2xl border border-hairline bg-cream p-6">
        <p className="font-display text-lg font-semibold">Book a lesson</p>
        {roster.length === 0 ? (
          <p className="mt-2 text-[15px] text-ink-soft">
            You&rsquo;ll be able to book lessons once you have students.{" "}
            <Link href="/students" className="font-semibold text-sea link-grow">
              Add students
            </Link>{" "}
            with your invite link first.
          </p>
        ) : (
          <div className="mt-4">
            <BookLessonForm roster={roster} selectedDayKey={selKey} />
          </div>
        )}
      </section>
    </>
  );
}
