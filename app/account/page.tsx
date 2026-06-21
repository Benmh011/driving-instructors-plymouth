import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

type Item = { href: string; title: string; desc: string };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true, onboardingComplete: true },
  });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  const isInstructor = user.role === "INSTRUCTOR";

  const items: Item[] = [
    ...(isInstructor
      ? [
          {
            href: "/dashboard/profile",
            title: "Profile",
            desc: "Your public details — name, photo, area, rate and bio.",
          },
        ]
      : []),
    {
      href: "/dashboard/security",
      title: "Security & login",
      desc: "Password, two-factor authentication, and closing your account.",
    },
    ...(isInstructor
      ? [
          {
            href: "/dashboard/billing",
            title: "Billing & subscription",
            desc: "Your plan, payment method and invoices.",
          },
        ]
      : []),
  ];

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <BackLink />

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Account
        </h1>

        <div className="mt-6 rounded-2xl border border-hairline bg-cream p-6">
          <p className="font-display text-xl font-semibold">{user.name}</p>
          <p className="mt-0.5 text-sm text-ink-soft">{user.email}</p>
          <p className="mt-3 inline-flex rounded-full bg-tarmac/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            {isInstructor ? "Instructor" : "Learner"}
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="lift flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-cream p-5 transition-colors hover:border-ink/30"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{it.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{it.desc}</p>
                </div>
                <span aria-hidden className="shrink-0 text-xl text-ink-soft">
                  &rsaquo;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
