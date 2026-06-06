"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      Sign out
    </button>
  );
}
