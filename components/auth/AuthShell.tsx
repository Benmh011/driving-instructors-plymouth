import Link from "next/link";
import { Logo } from "@/components/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-tarmac px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% 26%, rgba(44,138,160,0.20), transparent 72%)",
        }}
      />
      <Link href="/" className="relative mb-8">
        <Logo variant="onDark" />
      </Link>
      <div className="relative w-full max-w-md rounded-3xl border border-hairline bg-cream p-7 shadow-lg sm:p-9">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        <div className="mt-3 h-1 w-10 rounded-full bg-line" />
        {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
      {footer && (
        <div className="relative mt-6 text-sm text-paper/70">{footer}</div>
      )}
    </main>
  );
}
