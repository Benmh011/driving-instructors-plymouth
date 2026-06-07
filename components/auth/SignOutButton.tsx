"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-paper/25 px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper hover:text-tarmac"
    >
      Sign out
    </button>
  );
}
