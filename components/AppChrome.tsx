"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { Logo } from "./Logo";

const HIDDEN_ON = ["/", "/login", "/register", "/onboarding"];
const STORAGE_KEY = "dip-sidebar-collapsed";

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
  account: (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
  logout: (
    <svg {...iconProps}>
      <path d="M15 17v1.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2V7" />
      <path d="M10 12h11m0 0-3-3m3 3-3 3" />
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
  userName,
  children,
}: {
  role: string | null;
  userName?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Restore the saved preference once on the client.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const show = !!role && !HIDDEN_ON.includes(pathname);
  if (!show) return <>{children}</>;

  const tabs = role === "INSTRUCTOR" ? instructorTabs : learnerTabs;

  return (
    <div className="md:flex md:items-stretch">
      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-white/10 bg-tarmac transition-[width] duration-200 ease-in-out md:flex ${
          collapsed ? "md:w-[4.5rem]" : "md:w-64"
        }`}
      >
        <div
          className={`flex h-16 items-center border-b border-white/10 ${
            collapsed ? "justify-center px-2" : "gap-2 px-4"
          }`}
        >
          {!collapsed && (
            <div className="flex-1 pl-1">
              <Logo variant="onDark" href="/dashboard" />
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid h-9 w-9 place-items-center rounded-lg text-cream/70 transition-colors hover:bg-white/10 hover:text-cream"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-5 w-5 transition-transform duration-200 ${
                collapsed ? "rotate-180" : ""
              }`}
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {tabs.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                title={collapsed ? t.label : undefined}
                className={`relative flex items-center gap-3 rounded-xl py-2.5 text-[15px] font-semibold transition-colors ${
                  collapsed ? "justify-center px-0" : "px-4"
                } ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-cream/70 hover:bg-white/5 hover:text-cream"
                }`}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-line"
                  />
                )}
                <span className={active ? "text-sea" : ""}>{t.icon}</span>
                {!collapsed && t.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 px-3 py-3">
          {!collapsed && userName && (
            <p className="truncate px-4 pb-2 text-sm font-semibold text-cream">
              {userName}
            </p>
          )}
          <Link
            href="/account"
            title={collapsed ? "Account" : undefined}
            className={`flex items-center gap-3 rounded-xl py-2.5 text-[15px] font-semibold text-cream/70 transition-colors hover:bg-white/5 hover:text-cream ${
              collapsed ? "justify-center px-0" : "px-4"
            }`}
          >
            <span>{icons.account}</span>
            {!collapsed && "Account"}
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            title={collapsed ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 rounded-xl py-2.5 text-[15px] font-semibold text-cream/70 transition-colors hover:bg-white/5 hover:text-cream ${
              collapsed ? "justify-center px-0" : "px-4"
            }`}
          >
            <span>{icons.logout}</span>
            {!collapsed && "Sign out"}
          </button>
        </div>
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
