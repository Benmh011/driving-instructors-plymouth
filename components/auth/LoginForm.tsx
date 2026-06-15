"use client";

import { useActionState } from "react";
import { authenticate } from "@/app/(auth)/actions";

const field =
  "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";
const label = "mb-1.5 block text-sm font-semibold";

export default function LoginForm() {
  const [state, action, pending] = useActionState(authenticate, undefined);
  const needs2fa = state?.needs2fa ?? false;

  return (
    <form action={action} className="space-y-4">
      {/* Email + password stay mounted (so they still submit) but are hidden on
          the second step — the user only needs to enter the code there. */}
      <div className={needs2fa ? "hidden" : "space-y-4"}>
        <div>
          <label className={label} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} inputMode="email" required className={field} />
        </div>
        <div>
          <label className={label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={field}
          />
        </div>
      </div>

      {needs2fa && (
        <>
          {state?.email && (
            <div className="rounded-xl border border-hairline bg-cream/70 px-4 py-3 text-sm text-ink-soft">
              Signing in as <span className="font-semibold text-ink">{state.email}</span>
            </div>
          )}
          <div>
            <label className={label} htmlFor="code">
              Authentication code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="6-digit code"
              className={field}
            />
            <p className="mt-1 text-xs text-ink-soft">
              From your authenticator app — or use one of your backup codes.
            </p>
          </div>
        </>
      )}

      {state?.error && <p className="text-sm font-medium text-ink">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sea px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? needs2fa
            ? "Verifying…"
            : "Signing in…"
          : needs2fa
            ? "Verify code"
            : "Sign in"}
      </button>

      {needs2fa && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="block w-full text-center text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          Use a different account
        </button>
      )}
    </form>
  );
}
