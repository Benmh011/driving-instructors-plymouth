import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import {
  importSeedProspects,
  addProspect,
  updateProspect,
  deleteProspect,
} from "./actions";

export const metadata = { title: "Instructor outreach" };

type Prospect = {
  id: string;
  name: string;
  area: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: string;
  rating: number | null;
  notes: string | null;
  lastContactedAt: Date | null;
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  DEMO: "Demo booked",
  SIGNED_UP: "Signed up",
  NOT_INTERESTED: "Not interested",
  DO_NOT_CONTACT: "Do not contact",
};
const STATUS_ORDER = Object.keys(STATUS_LABELS);

function suggestedMessage(name: string) {
  return `Hi ${name},

I'm a local driving instructor and I've built Driving Instructors Plymouth — a booking and admin platform made for instructors around Plymouth and the South Hams. It handles your diary, student management, online payments and theory-test practice for your pupils, from £9.99/month on the founder rate.

Thought it might save you some admin time. If you'd like, I can send over a quick demo link to take a look.

If it's not for you, no worries at all — just say and I won't get in touch again.

Best,
[your name] — Driving Instructors Plymouth`;
}

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  if (!isAdminEmail(me?.email)) redirect("/dashboard");

  const { status: filter } = await searchParams;
  const activeFilter = filter && STATUS_ORDER.includes(filter) ? filter : "all";

  const prospects: Prospect[] = await prisma.prospect.findMany({
    where: activeFilter === "all" ? {} : { status: activeFilter },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      area: true,
      phone: true,
      email: true,
      website: true,
      status: true,
      rating: true,
      notes: true,
      lastContactedAt: true,
    },
  });

  const grouped = await prisma.prospect.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  let total = 0;
  for (const g of grouped as { status: string; _count: { _all: number } }[]) {
    counts[g.status] = g._count._all;
    total += g._count._all;
  }

  const field =
    "rounded-xl border border-ink/20 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-ink";

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Instructor outreach
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Your prospect list. Send personalised 1:1 messages from your own
          mailbox — each one identifies you and offers an easy opt-out. Mark
          anyone who asks to stop as &ldquo;Do not contact&rdquo; and don&rsquo;t
          message them again.
        </p>

        {total === 0 && (
          <form action={importSeedProspects} className="mt-6">
            <button
              type="submit"
              className="rounded-full bg-sea px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
            >
              Import starter list (24 local instructors)
            </button>
          </form>
        )}

        <div className="mt-6 rounded-2xl border border-hairline bg-cream p-4">
          <p className="font-display text-lg font-bold text-ink">Add a prospect</p>
          <form action={addProspect} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input name="name" required placeholder="Name *" className={`${field} sm:col-span-2`} />
            <input name="area" placeholder="Area / town" className={field} />
            <input name="phone" placeholder="Phone" className={field} />
            <input name="email" placeholder="Email" className={field} />
            <input name="website" placeholder="Website" className={field} />
            <button
              type="submit"
              className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 sm:col-span-2"
            >
              Add prospect
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <FilterChip label={`All (${total})`} href="/admin/outreach" active={activeFilter === "all"} />
          {STATUS_ORDER.map((s) => (
            <FilterChip
              key={s}
              label={`${STATUS_LABELS[s]} (${counts[s] ?? 0})`}
              href={`/admin/outreach?status=${s}`}
              active={activeFilter === s}
            />
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {prospects.map((p) => (
            <li key={p.id} className="rounded-2xl border border-hairline bg-cream p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-ink">{p.name}</p>
                  <p className="text-sm text-ink-soft">
                    {[p.area, p.rating ? `${p.rating}★` : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-line/20 px-2.5 py-0.5 text-xs font-semibold text-ink">
                  {STATUS_LABELS[p.status] ?? p.status}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {p.phone && (
                  <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="font-semibold text-sea">
                    {p.phone}
                  </a>
                )}
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-sea"
                  >
                    Website
                  </a>
                )}
                {p.email && <span className="text-ink-soft">{p.email}</span>}
                {p.lastContactedAt && (
                  <span className="text-ink-soft">
                    Last contacted {p.lastContactedAt.toLocaleDateString("en-GB")}
                  </span>
                )}
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-semibold text-sea">
                  Suggested message
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-hairline bg-white p-3 text-[13px] text-ink">
                  {suggestedMessage(p.name)}
                </pre>
              </details>

              <form action={updateProspect.bind(null, p.id)} className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <select name="status" defaultValue={p.status} className={field}>
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
                  >
                    Save
                  </button>
                </div>
                <textarea
                  name="notes"
                  rows={2}
                  defaultValue={p.notes ?? ""}
                  placeholder="Notes…"
                  className={`${field} w-full`}
                />
              </form>

              <form action={deleteProspect.bind(null, p.id)} className="mt-2">
                <button
                  type="submit"
                  className="text-xs font-semibold text-ink-soft transition-colors hover:text-signal"
                >
                  Delete
                </button>
              </form>
            </li>
          ))}
          {prospects.length === 0 && total > 0 && (
            <li className="rounded-2xl border border-hairline bg-cream p-5 text-[15px] text-ink-soft">
              None with this status.
            </li>
          )}
        </ul>
      </main>
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active ? "border-ink bg-ink text-white" : "border-ink/20 text-ink hover:border-ink"
      }`}
    >
      {label}
    </a>
  );
}
