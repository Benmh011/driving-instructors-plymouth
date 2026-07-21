"use client";

import { useActionState } from "react";
import { completeInstructor } from "@/app/onboarding/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function InstructorForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(completeInstructor, undefined);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label className={label} htmlFor="adiNumber">
          ADI badge number
        </label>
        <input id="adiNumber" name="adiNumber" type="text" placeholder="Your DVSA ADI number" required className={field} />
        <p className="mt-1 text-xs text-ink-soft">
          We verify all instructors are DVSA‑approved before going live.
        </p>
      </div>
      <div>
        <label className={label} htmlFor="phone">
          Contact number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="e.g. 07700 900123"
          required
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">
          So we can reach you about your account. Never shown to learners.
        </p>
      </div>
      <div>
        <label className={label} htmlFor="businessName">
          Business name <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input id="businessName" name="businessName" type="text" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="postcodes">
          Areas you cover
        </label>
        <input id="postcodes" name="postcodes" type="text" placeholder="e.g. PL1, PL3, Plympton, Saltash" required className={field} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="transmission">
            Transmission
          </label>
          <select id="transmission" name="transmission" defaultValue="MANUAL" className={field}>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="hourlyRate">
            Hourly rate (£)
          </label>
          <input id="hourlyRate" name="hourlyRate" type="number" min={1} placeholder="38" required className={field} />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="carDetails">
          Car <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input id="carDetails" name="carDetails" type="text" placeholder="e.g. Vauxhall Corsa, dual controls" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="bio">
          Short bio <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea id="bio" name="bio" rows={3} placeholder="Tell learners a little about you." className={field} />
      </div>

      {state?.error && <p className="text-sm font-medium text-ink">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Finish setup"}
      </button>
    </form>
  );
}
