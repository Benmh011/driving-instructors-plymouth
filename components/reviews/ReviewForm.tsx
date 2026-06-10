"use client";

import { useState } from "react";
import { useActionState } from "react";
import { submitReview, type ActionState } from "@/app/instructors/actions";

export default function ReviewForm({
  instructorId,
  initialRating,
  initialBody,
}: {
  instructorId: string;
  initialRating: number;
  initialBody: string;
}) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const action = submitReview.bind(null, instructorId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    undefined,
  );

  const shown = hover || rating;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${i} star${i === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-8 w-8 transition-colors ${
                i <= shown ? "text-line" : "text-ink/20"
              }`}
              fill="currentColor"
            >
              <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18.9 6.1 21.5l1.2-6.5L2.5 9.4l6.6-.9z" />
            </svg>
          </button>
        ))}
      </div>
      <textarea
        name="body"
        rows={3}
        defaultValue={initialBody}
        placeholder="How were your lessons? (optional)"
        className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink"
      />
      {state?.error && <p className="text-sm font-medium text-signal">{state.error}</p>}
      <button
        type="submit"
        disabled={pending || rating < 1}
        className="rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-50"
      >
        {pending ? "Saving…" : initialRating > 0 ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
