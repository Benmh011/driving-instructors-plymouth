"use client";

import { useActionState, useState } from "react";
import { registerUser } from "@/app/(auth)/actions";

type RoleChoice = "LEARNER" | "INSTRUCTOR";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function RegisterForm({ defaultRole = "LEARNER" }: { defaultRole?: RoleChoice }) {
  const [state, action, pending] = useActionState(registerUser, undefined);
  const [role, setRole] = useState<RoleChoice>(defaultRole);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role" value={role} />

      <div>
        <span className={label}>I am a…</span>
        <div className="grid grid-cols-2 gap-2">
          {(["LEARNER", "INSTRUCTOR"] as RoleChoice[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                role === r
                  ? "border-ink bg-tarmac text-white"
                  : "border-ink/20 bg-white hover:border-ink"
              }`}
            >
              {r === "LEARNER" ? "Learner" : "Instructor"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="name">
          Full name
        </label>
        <input id="name" name="name" type="text" autoComplete="name" required className={field} />
      </div>
      <div>
        <label className={label} htmlFor="email">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} />
      </div>
      <div>
        <label className={label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={field}
        />
        <p className="mt-1 text-xs text-ink-soft">At least 8 characters.</p>
      </div>

      {state?.error && <p className="text-sm font-medium text-ink">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-tarmac px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-tarmac-soft disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
