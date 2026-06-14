"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Student = {
  id: string;
  name: string;
  postcode: string;
  transmission: string;
  goal: string | null;
};

type Sort = "first" | "last" | "added";

function pretty(t: string) {
  return t === "BOTH" ? "Either" : t.charAt(0) + t.slice(1).toLowerCase();
}

function lastName(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[parts.length - 1] || name).toLowerCase();
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function RosterList({ students }: { students: Student[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("first");

  const view = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = students;
    if (term) {
      list = students.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.postcode.toLowerCase().includes(term),
      );
    }
    const sorted = [...list];
    if (sort === "first") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "last") {
      sorted.sort((a, b) => lastName(a.name).localeCompare(lastName(b.name)));
    } else {
      // "added" — incoming order is oldest-first, so reverse for newest-first.
      sorted.reverse();
    }
    return sorted;
  }, [students, q, sort]);

  const field =
    "w-full rounded-xl border border-ink/20 bg-white px-4 py-2.5 text-[15px] outline-none transition-colors focus:border-ink";

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or postcode"
            className={`${field} pl-10`}
            aria-label="Search students"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className={`${field} sm:w-52`}
          aria-label="Sort students"
        >
          <option value="first">Sort: First name</option>
          <option value="last">Sort: Last name</option>
          <option value="added">Sort: Recently added</option>
        </select>
      </div>

      {view.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-5 text-[15px] text-ink-soft">
          No students match &ldquo;{q.trim()}&rdquo;.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {view.map((s) => (
            <li key={s.id}>
              <Link
                href={`/students/${s.id}`}
                className="lift press flex items-center gap-3 rounded-2xl border border-hairline bg-cream p-4 hover:border-ink/20"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-tarmac/10 text-sm font-bold text-tarmac">
                  {initials(s.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{s.name}</p>
                  <p className="truncate text-sm text-ink-soft">
                    {s.postcode} &middot; {pretty(s.transmission)}
                    {s.goal ? ` · ${s.goal}` : ""}
                  </p>
                </div>
                <svg
                  className="h-4 w-4 shrink-0 text-ink-soft"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
