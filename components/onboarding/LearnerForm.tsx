"use client";

import { useActionState } from "react";
import { completeLearner } from "@/app/onboarding/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-signal";
const label = "mb-1.5 block text-sm font-semibold";

export default function LearnerForm() {
  const [state, action, pending] = useActionState(completeLearner, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={label} htmlFor="postcode">
          Your area or postcode
        </label>
        <input id="postcode" name="postcode" type="text" placeholder="e.g. PL1 or Plympton" required className={field} />
      </div>
      <div>
        <label className={label} htmlFor="transmission">
          Which would you like to learn in?
        </label>
        <select id="transmission" name="transmission" defaultValue="MANUAL" className={field}>
          <option value="MANUAL">Manual</option>
          <option value="AUTOMATIC">Automatic</option>
          <option value="BOTH">Either is fine</option>
        </select>
      </div>
      <div>
        <label className={label} htmlFor="goal">
          Your goal <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input id="goal" name="goal" type="text" placeholder="e.g. Pass before September" className={field} />
      </div>

      {state?.error && <p className="text-sm font-medium text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-signal px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-signal-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Finish setup"}
      </button>
    </form>
  );
}
