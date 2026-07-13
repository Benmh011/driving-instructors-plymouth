import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

const TOOLS = [
  {
    href: "/admin/users",
    title: "All users",
    desc: "Everyone who's signed up — learners and instructors.",
  },
  {
    href: "/admin/waitlist",
    title: "Learner waitlist",
    desc: "Learners waiting to be matched with an instructor.",
  },
  {
    href: "/admin/verification",
    title: "ADI verification",
    desc: "Review and approve instructor badges.",
  },
  {
    href: "/admin/outreach",
    title: "Instructor outreach",
    desc: "Prospect pipeline, drafts and follow-ups.",
  },
  {
    href: "/admin/theory",
    title: "Theory admin",
    desc: "Review flagged theory questions.",
  },
];

export default async function AdminHubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!isAdminEmail(me?.email)) redirect("/dashboard");

  return (
    <div className="min-h-dvh bg-cream">
      <AppHeader right={<SignOutButton />} />
      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        <BackLink href="/dashboard" label="Back to dashboard" />
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">Admin</h1>
        <p className="mt-1 text-ink-soft">Everything in one place.</p>

        <ul className="mt-6 space-y-3">
          {TOOLS.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className="lift flex items-center justify-between gap-4 rounded-2xl border border-hairline bg-paper p-5 transition-colors hover:border-ink/30"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{t.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{t.desc}</p>
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
