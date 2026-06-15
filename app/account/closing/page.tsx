import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import { restoreAccount } from "@/app/account/actions";

export const metadata = { title: "Account closing" };

export default async function AccountClosingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, deletionScheduledFor: true },
  });
  if (!user) redirect("/login");
  // Not actually closing — nothing to see here.
  if (!user.deletionScheduledFor) redirect("/dashboard");

  const when = user.deletionScheduledFor.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/" right={<SignOutButton />} />

      <main className="mx-auto flex max-w-md flex-col px-5 py-16 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Your account is closing
        </h1>
        <p className="mt-3 text-ink-soft">
          It&rsquo;s scheduled to be permanently deleted on{" "}
          <span className="font-semibold text-ink">{when}</span>. Until then your
          profile is hidden and your account is locked.
        </p>
        <p className="mt-2 text-ink-soft">
          Changed your mind? You can bring everything back exactly as it was.
        </p>

        <form action={restoreAccount} className="mt-6">
          <button
            type="submit"
            className="press w-full rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark"
          >
            Restore my account
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          If you do nothing, your account and data will be deleted on {when}.
        </p>
      </main>
    </div>
  );
}
