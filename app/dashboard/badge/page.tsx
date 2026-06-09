import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import SignOutButton from "@/components/auth/SignOutButton";
import BadgeUpload from "@/components/badge/BadgeUpload";

export const metadata = { title: "ADI badge" };

export default async function BadgePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instructorProfile: true },
  });
  if (!user) redirect("/login");
  if (user.role !== "INSTRUCTOR" || !user.instructorProfile) redirect("/dashboard");

  const i = user.instructorProfile;
  const status = i.adiStatus as string;
  const badgeUrl = i.adiBadgeUrl as string | null;

  const statusLabel =
    status === "VERIFIED"
      ? "Verified"
      : status === "REJECTED"
        ? "Not verified"
        : "Awaiting review";

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Your ADI badge
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Upload a clear photo of your green ADI badge to speed up verification. We check
          it against the DVSA register, then your profile goes live in the directory.
          Current status: <span className="font-semibold text-ink">{statusLabel}</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-hairline bg-cream p-6">
          {badgeUrl && (
            <div className="mb-5">
              <p className="mb-2 text-sm font-semibold">Current badge on file</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/badge/${i.id}`}
                alt="Your uploaded ADI badge"
                className="max-h-64 rounded-xl border border-hairline"
              />
            </div>
          )}
          <BadgeUpload />
          <p className="mt-3 text-sm text-ink-soft">
            JPG, PNG or WebP, up to 15MB. Uploading a new photo sends you back into the
            review queue.
          </p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
