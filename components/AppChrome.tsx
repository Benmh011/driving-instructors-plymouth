"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

const HIDDEN_ON = ["/", "/login", "/register", "/onboarding"];

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-6 w-6",
};

const icons = {
  home: (
    <svg {...iconProps}>
      <path d="M3 10.5 12 4l9 6.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  ),
  calendar: (
    <svg {...iconProps}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  ),
  users: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M17.5 13.2a5 5 0 0 1 3 4.8" />
    </svg>
  ),
  money: (
    <svg {...iconProps}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ),
  search: (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  chat: (
    <svg {...iconProps}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" />
    </svg>
  ),
};

type Tab = {
  href: string;
  label: string;
  icon: ReactNode;
  match: (p: string) => boolean;
};

const instructorTabs: Tab[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: icons.home,
    match: (p) =>
      p === "/dashboard" ||
      p.startsWith("/dashboard/profile") ||
      p.startsWith("/dashboard/badge"),
  },
  { href: "/diary", label: "Diary", icon: icons.calendar, match: (p) => p.startsWith("/diary") },
  { href: "/students", label: "Students", icon: icons.users, match: (p) => p.startsWith("/students") },
  { href: "/messages", label: "Messages", icon: icons.chat, match: (p) => p.startsWith("/messages") },
  { href: "/dashboard/tax", label: "Earnings", icon: icons.money, match: (p) => p.startsWith("/dashboard/tax") },
];

const learnerTabs: Tab[] = [
  { href: "/dashboard", label: "Home", icon: icons.home, match: (p) => p === "/dashboard" },
  { href: "/diary", label: "Lessons", icon: icons.calendar, match: (p) => p.startsWith("/diary") },
  { href: "/messages", label: "Messages", icon: icons.chat, match: (p) => p.startsWith("/messages") },
  { href: "/instructors", label: "Find", icon: icons.search, match: (p) => p.startsWith("/instructors") },
];

export default function AppChrome({
  role,
  children,
}: {
  role: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const show = !!role && !HIDDEN_ON.includes(pathname);

  if (!show) return <>{children}</>;

  const tabs = role === "INSTRUCTOR" ? instructorTabs : learnerTabs;

  return (
    <div className="md:flex md:items-stretch">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-30 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-tarmac md:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo variant="onDark" href="/dashboard" />
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {tabs.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] font-semibold transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-cream/70 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <span className={active ? "text-sea" : ""}>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Page content */}
      <div className="min-w-0 flex-1">{children}</div>

      {/* Mobile floating bar */}
      <div className="h-28 md:hidden" aria-hidden />
      <div
        className="fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <nav className="mx-auto mb-2 flex max-w-md items-stretch justify-around rounded-2xl border border-hairline bg-cream/95 shadow-[0_6px_24px_rgba(20,36,54,0.16)] backdrop-blur-md">
          {tabs.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-sea" : "text-ink-soft"
                }`}
              >
                {t.icon}
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
