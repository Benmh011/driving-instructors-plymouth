"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

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

export default function BottomNavBar({ role }: { role: string }) {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  const tabs = role === "INSTRUCTOR" ? instructorTabs : learnerTabs;

  return (
    <>
      <div className="h-20 md:hidden" aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-cream/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around">
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
        </div>
      </nav>
    </>
  );
}
