"use client";

import { useState } from "react";

export default function InviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (e.g. insecure context) — the field is selectable as a fallback.
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink-soft outline-none"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full bg-sea px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-sea-dark"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
