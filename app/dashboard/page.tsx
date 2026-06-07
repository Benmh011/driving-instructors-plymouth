import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ joined?: string }>;
}) {
  const { joined } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      learnerProfile: { include: { activeInstructor: { include: { user: true } } } },
      instructorProfile: true,
    },
  });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  const isInstructor = user.role === "INSTRUCTOR";
  const l = user.learnerProfile;
  const i = user.instructorProfile;
  const instructor = l?.activeInstructor;
  const instructorName = instructor
    ? instructor.businessName || instructor.user.name
    : null;

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        {joined && instructorName && (
          <div className="mb-8 rounded-2xl border border-sea/30 bg-sea/10 px-5 py-4">
            <p className="text-[15px] font-medium text-ink">
              You&rsquo;re now on {instructorName}&rsquo;s student list.
            </p>
          </div>
        )}

        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-sea">
          {isInstructor ? "Instructor account" : "Learner account"}
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome, {user.name.split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Your account is set up. Here&rsquo;s what you told us — you&rsquo;ll be able to
          edit all of this once profiles go live.
        </p>

        <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-2">
          {isInstructor && i ? (
            <>
              <Cell label="ADI badge number" value={i.adiNumber} />
              <Cell label="Areas covered" value={i.postcodes} />
              <Cell label="Transmission" value={pretty(i.transmission)} />
              <Cell label="Hourly rate" value={`£${i.hourlyRate}`} />
              {i.businessName && <Cell label="Business" value={i.businessName} />}
              {i.carDetails && <Cell label="Car" value={i.carDetails} />}
            </>
          ) : l ? (
            <>
              <Cell label="Area" value={l.postcode} />
              <Cell label="Transmission" value={pretty(l.transmission)} />
              {l.goal && <Cell label="Goal" value={l.goal} />}
              <Cell label="Your instructor" value={instructorName ?? "Not joined yet"} />
            </>
          ) : null}
        </div>

        {isInstructor ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NavCard
              href="/students"
              title="Your students"
              desc="Share your invite link and manage your roster."
            />
            <NavCard
              href="/diary"
              title="Your diary"
              desc="Book and manage your lessons."
            />
          </div>
        ) : instructorName ? (
          <NavCard
            href="/diary"
            title="Your lessons"
            desc={`See your lessons with ${instructorName}.`}
            className="mt-5"
          />
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="font-display text-lg font-semibold">Joining an instructor</p>
            <p className="mt-1 text-[15px] text-ink-soft">
              If your instructor sent you an invite link, open it to join their list.
              Searching for an instructor here is coming soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  className = "",
}: {
  href: string;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl border border-hairline bg-cream p-6 transition-colors hover:border-ink/30 ${className}`}
    >
      <div>
        <p className="font-display text-lg font-semibold">{title}</p>
        <p className="mt-1 text-[15px] text-ink-soft">{desc}</p>
      </div>
      <span className="ml-4 shrink-0 text-2xl text-ink-soft" aria-hidden>
        &rarr;
      </span>
    </Link>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function pretty(t: string) {
  return t === "BOTH" ? "Either" : t.charAt(0) + t.slice(1).toLowerCase();
}
