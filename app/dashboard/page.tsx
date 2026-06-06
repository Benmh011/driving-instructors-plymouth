import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import SignOutButton from "@/components/auth/SignOutButton";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { learnerProfile: true, instructorProfile: true },
  });
  if (!user) redirect("/login");
  if (!user.onboardingComplete) redirect("/onboarding");

  const isInstructor = user.role === "INSTRUCTOR";
  const l = user.learnerProfile;
  const i = user.instructorProfile;

  return (
    <div className="relative z-10 min-h-dvh">
      <header className="border-b border-hairline bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-ink">
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
            </>
          ) : null}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
          <p className="font-display text-lg font-semibold">Coming next</p>
          <p className="mt-1 text-[15px] text-ink-soft">
            {isInstructor
              ? "Your public profile, availability calendar, and incoming booking requests."
              : "Search and matching by area, instructor profiles, and booking lessons."}
          </p>
        </div>
      </main>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function pretty(t: string) {
  return t === "BOTH" ? "Either" : t.charAt(0) + t.slice(1).toLowerCase();
}
