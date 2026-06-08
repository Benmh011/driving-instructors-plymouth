"use client";

import { useActionState } from "react";
import { updateInstructorProfile } from "@/app/dashboard/profile/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function EditProfileForm({
  businessName,
  postcodes,
  transmission,
  hourlyRate,
  carDetails,
  bio,
  cancellationNoticeHours,
}: {
  businessName: string;
  postcodes: string;
  transmission: string;
  hourlyRate: number;
  carDetails: string;
  bio: string;
  cancellationNoticeHours: number;
}) {
  const [state, action, pending] = useActionState(updateInstructorProfile, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={label} htmlFor="businessName">
          Business name <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          defaultValue={businessName}
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="postcodes">
          Areas you cover
        </label>
        <input
          id="postcodes"
          name="postcodes"
          type="text"
          defaultValue={postcodes}
          placeholder="e.g. PL1, PL3, Plympton, Saltash"
          required
          className={field}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor="transmission">
            Transmission
          </label>
          <select
            id="transmission"
            name="transmission"
            defaultValue={transmission}
            className={field}
          >
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="hourlyRate">
            Hourly rate (£)
          </label>
          <input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min={1}
            defaultValue={hourlyRate}
            required
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="carDetails">
          Car <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="carDetails"
          name="carDetails"
          type="text"
          defaultValue={carDetails}
          placeholder="e.g. Vauxhall Corsa, dual controls"
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="bio">
          Short bio <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={bio}
          placeholder="Tell learners a little about you."
          className={`${field} resize-y`}
        />
      </div>

      <div>
        <label className={label} htmlFor="cancellationNoticeHours">
          Cancellation notice (hours)
        </label>
        <input
          id="cancellationNoticeHours"
          name="cancellationNoticeHours"
          type="number"
          min={0}
          max={168}
          defaultValue={cancellationNoticeHours}
          required
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">
          How much notice you ask for when a lesson is cancelled.
        </p>
      </div>

      {state?.error && <p className="text-sm font-medium text-signal">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
