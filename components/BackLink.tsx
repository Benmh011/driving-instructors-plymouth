import Link from "next/link";

export default function BackLink({
  href = "/dashboard",
  label = "Dashboard",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 rounded-full border border-hairline bg-cream/70 px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
    >
      <svg
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  );
}
