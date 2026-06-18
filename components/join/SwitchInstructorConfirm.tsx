"use client";

import { useState } from "react";
import { joinInstructor } from "@/app/join/[code]/actions";

// Switching instructors is consequential, so we make the effects explicit and
// gate the action behind a confirmation tick to prevent accidental moves.
export default function SwitchInstructorConfirm({
  code,
  currentName,
  newName,
}: {
  code: string;
  currentName: string;
  newName: string;
}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-line/60 bg-line/10 p-4">
        <p className="text-sm font-semibold text-ink">
          Heads up — this switches your instructor
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>
            You&rsquo;ll be moved from <strong>{currentName}</strong> to{" "}
            <strong>{newName}</strong>.
          </li>
          <li>
            {currentName} will no longer be your active instructor, and
            you&rsquo;ll come off their student list.
          </li>
          <li>
            Lessons already booked with {currentName} won&rsquo;t cancel
            automatically — sort those out with them first.
          </li>
        </ul>
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-sea"
        />
        <span>
          I understand I&rsquo;ll be moved from {currentName} to {newName}.
        </span>
      </label>

      <form action={joinInstructor.bind(null, code)} className="mt-5">
        <button
          type="submit"
          disabled={!confirmed}
          className="inline-flex w-full items-center justify-center rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Move to {newName}
        </button>
      </form>
    </div>
  );
}
