import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import { MAX_ROSTER } from "@/lib/constants";

export const metadata = {
  title: "Find a driving instructor in Plymouth",
  description:
    "Browse approved driving instructors across Plymouth and South West Devon. Filter by area and gearbox, then request lessons.",
};

type DirItem = {
  id: string;
  businessName: string | null;
  postcodes: string;
  transmission: string;
  hourlyRate: number;
  bio: string | null;
  acceptingStudents: boolean;
  user: { name: string };
  _count: { roster: number };
};

function pretty(t: string) {
  return t === "BOTH" ? "Manual & automatic" : t.charAt(0) + t.slice(1).toLowerCase();
}

export default async function InstructorsPage({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; transmission?: string }>;
}) {
  const { area = "", transmission = "" } = await searchParams;
  const session = await auth();

  const areaTrim = area.trim();
  const instructors: DirItem[] = await prisma.instructorProfile.findMany({
    where: {
      user: { onboardingComplete: true },
      postcodes: areaTrim ? { contains: areaTrim, mode: "insensitive" } : undefined,
      transmission:
        transmission === "MANUAL"
          ? { in: ["MANUAL", "BOTH"] }
          : transmission === "AUTOMATIC"
            ? { in: ["AUTOMATIC", "BOTH"] }
            : undefined,
    },
    orderBy: [{ acceptingStudents: "desc" }, { createdAt: "asc" }],
    include: { user: true, _count: { select: { roster: true } } },
  });

  const right = session ? (
    <SignOutButton />
  ) : (
    <Link
      href="/login"
      className="rounded-full border border-paper/25 px-4 py-2 text-sm font-semibold text-paper transition-colors hover:border-paper hover:bg-paper hover:text-tarmac"
    >
      Log in
    </Link>
  );

  const field =
    "w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink";

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/" right={right} />

      <main className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Find an instructor
        </h1>
        <p className="mt-3 max-w-lg text-ink-soft">
          Approved driving instructors across Plymouth and South West Devon. Filter by
          your area and gearbox, then send a request.
        </p>

        {/* Search */}
        <form
          method="get"
          className="mt-8 flex flex-col gap-3 rounded-2xl border border-hairline bg-cream p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="area">
              Area or postcode
            </label>
            <input
              id="area"
              name="area"
              defaultValue={area}
              placeholder="e.g. PL4, Plymstock, Plympton"
              className={field}
            />
          </div>
          <div className="sm:w-52">
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="transmission">
              Gearbox
            </label>
            <select id="transmission" name="transmission" defaultValue={transmission} className={field}>
              <option value="">Any</option>
              <option value="MANUAL">Manual</option>
              <option value="AUTOMATIC">Automatic</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-sea px-6 py-3 font-semibold text-white transition-colors hover:bg-sea-dark"
          >
            Search
          </button>
        </form>

        {/* Results */}
        <p className="mt-8 text-sm font-semibold text-ink-soft">
          {instructors.length} instructor{instructors.length === 1 ? "" : "s"}
          {area.trim() || transmission ? " match your search" : " listed"}
        </p>

        {instructors.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-paper-dim/40 p-6">
            <p className="text-[15px] text-ink-soft">
              No instructors match that yet. Try a wider area or clearing the gearbox
              filter.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {instructors.map((i) => {
              const full = !i.acceptingStudents || i._count.roster >= MAX_ROSTER;
              return (
                <li key={i.id}>
                  <Link
                    href={`/instructors/${i.id}`}
                    className="flex h-full flex-col rounded-2xl border border-hairline bg-cream p-6 transition-colors hover:border-ink/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-display text-lg font-semibold">
                        {i.businessName || i.user.name}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          full
                            ? "bg-ink/10 text-ink-soft"
                            : "bg-go/15 text-go"
                        }`}
                      >
                        {full ? "Books full" : "Taking students"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      {i.postcodes} &middot; {pretty(i.transmission)}
                    </p>
                    {i.bio && (
                      <p className="mt-3 line-clamp-2 text-[15px] text-ink">{i.bio}</p>
                    )}
                    <p className="mt-4 font-semibold">£{i.hourlyRate}/hr</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
