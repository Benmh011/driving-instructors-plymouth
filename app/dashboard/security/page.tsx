import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import { TwoFactorManager } from "@/components/security/TwoFactorManager";
import { CloseAccountSection } from "@/components/security/CloseAccountSection";

export const metadata = { title: "Security" };

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, onboardingComplete: true },
  });
  if (!user) redirect("/login");

  const continueHref = user.onboardingComplete ? "/dashboard" : "/onboarding";

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <Link
          href={continueHref}
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; {user.onboardingComplete ? "Back to dashboard" : "Continue to setup"}
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">Security</h1>
        <p className="mt-2 text-ink-soft">
          Two-factor authentication adds a one-time code to your sign-in, so a
          stolen password isn&apos;t enough to get into your account on its own.
        </p>

        <div className="mt-8">
          <TwoFactorManager
            enabled={user.twoFactorEnabled}
            autoStart={sp.setup === "1" && !user.twoFactorEnabled}
            continueHref={continueHref}
          />
        </div>

        <CloseAccountSection />
      </main>
    </div>
  );
}
