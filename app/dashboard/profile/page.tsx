import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import EditProfileForm from "@/components/profile/EditProfileForm";
import PhotoUpload from "@/components/profile/PhotoUpload";
import { Avatar } from "@/components/profile/Avatar";
import { ensureInstructorSlug } from "@/lib/slug";
import { formatCar } from "@/lib/car";
import { instructorPhotoSrc } from "@/lib/photo";

export const metadata = { title: "Your profile" };

function pretty(t: string) {
  return t === "BOTH" ? "Manual & automatic" : t.charAt(0) + t.slice(1).toLowerCase();
}

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
  const displayName = p.businessName || user.name;
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((w: string) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  const verified = p.adiStatus === "VERIFIED";
  const slug = await ensureInstructorSlug({
    id: p.id,
    slug: p.slug,
    businessName: p.businessName,
    user: { name: user.name },
  });

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-xl px-5 py-14 sm:px-8">
        <BackLink />

        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
          Your profile
        </h1>
        <p className="mt-2 text-ink-soft">
          This is what learners see in the directory. Changes go live straight away.
        </p>

        <a
          href={`/instructors/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="press mt-4 inline-flex rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink"
        >
          View public profile &#8599;
        </a>

        <div className="mt-6 rounded-2xl border border-hairline bg-cream p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Profile photo
          </p>
          <div className="mt-3">
            <PhotoUpload photoSrc={instructorPhotoSrc(p.id, p.photoUrl)} initials={initials} />
          </div>
        </div>

        {/* Preview (no reviews — those live on the public page) */}
        <div className="mt-6 rounded-2xl border border-hairline bg-cream p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
            Preview
          </p>
          <div className="mt-1 flex items-center gap-4">
            <Avatar
              photoSrc={instructorPhotoSrc(p.id, p.photoUrl)}
              initials={initials}
              className="h-14 w-14 rounded-2xl"
              textClassName="text-xl"
            />
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {displayName}
            </h2>
          </div>
          <p className="mt-1 text-ink-soft">
            {p.postcodes} &middot; {pretty(p.transmission)} &middot; £{p.hourlyRate}/hr
          </p>
          <p className={`mt-1 text-sm font-medium ${verified ? "text-go" : "text-ink-soft"}`}>
            {verified ? "DVSA approved" : "ADI badge awaiting verification"}
          </p>
          {p.bio && (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {p.bio}
            </p>
          )}
          {(formatCar(p) || p.carDetails) && (
            <p className="mt-3 text-[15px] text-ink-soft">
              Tuition car:{" "}
              {[formatCar(p), p.carDetails].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

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
            carMake={p.carMake ?? ""}
            carModel={p.carModel ?? ""}
            carYear={p.carYear ?? null}
            carColour={p.carColour ?? ""}
            carDetails={p.carDetails ?? ""}
            bio={p.bio ?? ""}
            cancellationNoticeHours={p.cancellationNoticeHours}
          />
        </div>
      </main>
    </div>
  );
}
