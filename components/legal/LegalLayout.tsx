import Link from "next/link";
import { auth } from "@/auth";
import { Header } from "@/components/Header";
import { AppHeader } from "@/components/AppHeader";
import { Footer } from "@/components/Footer";
import { LEGAL } from "@/lib/legal";

export async function LegalLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  const session = await auth();
  const signedIn = !!session?.user?.id;

  return (
    <div className="relative z-10">
      {signedIn ? <AppHeader home="/dashboard" /> : <Header />}

      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <Link
          href={signedIn ? "/dashboard" : "/"}
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; {signedIn ? "Back to dashboard" : "Back home"}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Last updated: {LEGAL.lastUpdated}
        </p>

        {intro && (
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{intro}</p>
        )}

        <div className="legal-prose mt-8">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
