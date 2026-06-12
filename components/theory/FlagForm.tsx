"use client";

import { useActionState, useState } from "react";
import { submitTheoryFeedback, type FeedbackState } from "@/app/theory/review/actions";

export default function FlagForm({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const action = submitTheoryFeedback.bind(null, questionId);
  const [state, formAction, pending] = useActionState<FeedbackState, FormData>(
    action,
    undefined,
  );

  if (state?.ok) {
    return (
      <p className="mt-3 text-sm font-semibold text-go">
        Thanks — your note has been sent to the team.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-sm font-semibold text-sea transition-colors hover:text-sea-dark"
      >
        Flag an issue
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <textarea
        name="comment"
        rows={2}
        required
        placeholder="What's wrong? e.g. the answer should be B, or the wording is unclear."
        className="w-full rounded-xl border border-ink/20 bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-ink"
      />
      {state?.error && (
        <p className="text-sm font-medium text-signal">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea-dark disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
