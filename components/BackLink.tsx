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
      className="group lift press inline-flex items-center gap-1.5 rounded-full border border-hairline bg-cream px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-tarmac hover:bg-tarmac hover:text-paper"
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
