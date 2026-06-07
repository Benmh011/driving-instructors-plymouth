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
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center bg-tarmac px-5 py-12">
      <div className="roadline absolute left-0 top-0" aria-hidden />
      <Link href="/" className="mb-8">
        <Logo variant="onDark" />
      </Link>
      <div className="w-full max-w-md rounded-3xl border border-hairline bg-cream p-7 shadow-lg sm:p-9">
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-paper/70">{footer}</div>}
    </main>
  );
}
