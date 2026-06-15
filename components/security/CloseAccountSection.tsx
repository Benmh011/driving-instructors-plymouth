"use client";

import { useActionState, useState } from "react";
import { requestAccountDeletion } from "@/app/account/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-signal";

export function CloseAccountSection() {
  const [state, action, pending] = useActionState(
    requestAccountDeletion,
    undefined,
  );
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mt-10 rounded-2xl border border-signal/30 bg-signal/5 p-6">
      <p className="font-semibold text-ink">Close account</p>
      <p className="mt-1.5 text-sm text-ink-soft">
        This schedules your account for deletion in 30 days. Your profile is
        hidden straight away, and you can restore it any time before then by
        signing back in. After 30 days it&apos;s permanent.
      </p>

      {confirming ? (
        <form action={action} className="mt-4 space-y-3">
          <p className="text-sm text-ink">Enter your password to confirm:</p>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Your password"
            className={field}
          />
          {state?.error && (
            <p className="text-sm font-medium text-signal">{state.error}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className="press rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Scheduling…" : "Schedule deletion"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="press rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="press mt-4 rounded-full border border-signal/40 px-5 py-2.5 text-sm font-semibold text-signal transition-colors hover:bg-signal/10"
        >
          Close my account
        </button>
      )}
    </div>
  );
}
