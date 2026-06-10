import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import EditProfileForm from "@/components/profile/EditProfileForm";

export const metadata = { title: "Edit your details" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { instructorProfile: true },
  });
  if (!user) redirect("/login");
  if (user.role !== "INSTRUCTOR" || !user.instructorProfile) redirect("/dashboard");

  const p = user.instructorProfile;

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          &larr; Back to dashboard
        </Link>

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Edit your details
        </h1>
        <p className="mt-2 text-ink-soft">
          This is what learners see in the directory. Changes go live straight away.
        </p>

        <div className="mt-6 rounded-2xl border border-hairline bg-paper-dim/40 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            ADI badge number
          </p>
          <p className="mt-1 font-medium">{p.adiNumber}</p>
          <p className="mt-1 text-xs text-ink-soft">
            Tied to your DVSA verification — to change this, re-upload your badge from
            the dashboard.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-hairline bg-cream p-6">
          <EditProfileForm
            businessName={p.businessName ?? ""}
            postcodes={p.postcodes}
            transmission={p.transmission}
            hourlyRate={p.hourlyRate}
            carDetails={p.carDetails ?? ""}
            bio={p.bio ?? ""}
            cancellationNoticeHours={p.cancellationNoticeHours}
          />
        </div>
      </main>
    </div>
  );
}
