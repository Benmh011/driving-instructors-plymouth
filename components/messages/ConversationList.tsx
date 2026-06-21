"use client";

import { useState } from "react";
import Link from "next/link";

type Convo = {
  learnerId: string;
  name: string;
  lastBody: string | null;
  lastLabel: string | null;
  fromMe: boolean;
  unread: number;
};

export default function ConversationList({ convos }: { convos: Convo[] }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const shown = term
    ? convos.filter((c) => c.name.toLowerCase().includes(term))
    : convos;

  return (
    <div className="mt-6">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search students…"
        className="w-full rounded-xl border border-ink/20 bg-white px-4 py-2.5 text-base outline-none transition-colors focus:border-ink"
      />

      {shown.length === 0 ? (
        <p className="mt-6 text-[15px] text-ink-soft">
          No students match &ldquo;{q}&rdquo;.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {shown.map((c) => (
            <li key={c.learnerId}>
              <Link
                href={`/messages/${c.learnerId}`}
                className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors ${
                  c.unread > 0
                    ? "border-sea/40 bg-sea/5"
                    : "border-hairline bg-cream hover:border-ink/30"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate ${
                        c.unread > 0 ? "font-bold" : "font-semibold"
                      }`}
                    >
                      {c.name}
                    </p>
                    {c.lastLabel && (
                      <span className="ml-auto shrink-0 text-xs text-ink-soft">
                        {c.lastLabel}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-soft">
                    {c.lastBody
                      ? c.fromMe
                        ? `You: ${c.lastBody}`
                        : c.lastBody
                      : "No messages yet"}
                  </p>
                </div>
                {c.unread > 0 && (
                  <span className="shrink-0 rounded-full bg-signal px-2.5 py-1 text-xs font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
