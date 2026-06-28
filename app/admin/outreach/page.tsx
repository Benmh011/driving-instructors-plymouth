import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { AppHeader } from "@/components/AppHeader";
import SignOutButton from "@/components/auth/SignOutButton";
import BackLink from "@/components/BackLink";
import ClearProspectsButton from "@/components/outreach/ClearProspectsButton";
import {
  importSeedProspects,
  addProspect,
  updateProspect,
  deleteProspect,
  generateDrafts,
  generateFollowUps,
  updateDraft,
  sendDraft,
  discardDraft,
} from "./actions";
import { FOLLOWUP_AFTER_DAYS, MAX_TOUCHES } from "@/lib/outreach/draft";

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

type Draft = {
  id: string;
  subject: string;
  body: string;
  status: string;
  error: string | null;
  prospect: { name: string; email: string | null; emails: { id: string }[] };
};

type SentEmail = {
  id: string;
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  bouncedAt: Date | null;
  complainedAt: Date | null;
  prospect: { name: string };
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

  const drafts: Draft[] = await prisma.outreachEmail.findMany({
    where: { status: { in: ["DRAFT", "FAILED"] } },
    include: {
      prospect: {
        select: {
          name: true,
          email: true,
          emails: { where: { status: "SENT" }, select: { id: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
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
  const withEmail = await prisma.prospect.count({ where: { email: { not: null } } });
  const sentCount = await prisma.outreachEmail.count({ where: { status: "SENT" } });
  const sent: SentEmail[] = await prisma.outreachEmail.findMany({
    where: { status: "SENT" },
    orderBy: { sentAt: "desc" },
    take: 50,
    select: {
      id: true,
      sentAt: true,
      deliveredAt: true,
      openedAt: true,
      bouncedAt: true,
      complainedAt: true,
      prospect: { select: { name: true } },
    },
  });

  const field =
    "rounded-xl border border-ink/20 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors focus:border-ink";

  // How many contacted prospects are due a follow-up (no reply, last email old
  // enough, still under the touch cap, no draft already waiting).
  const followUpCutoff = new Date(
    Date.now() - FOLLOWUP_AFTER_DAYS * 24 * 60 * 60 * 1000,
  );
  const followUpCandidates = await prisma.prospect.findMany({
    where: {
      status: "CONTACTED",
      email: { not: null },
      emails: { some: { status: "SENT" }, none: { status: "DRAFT" } },
    },
    select: {
      id: true,
      emails: {
        where: { status: "SENT" },
        select: { sentAt: true },
        orderBy: { sentAt: "desc" },
      },
    },
  });
  let dueFollowUp = 0;
  for (const p of followUpCandidates as {
    id: string;
    emails: { sentAt: Date | null }[];
  }[]) {
    const lastSentAt = p.emails[0]?.sentAt;
    if (p.emails.length < MAX_TOUCHES && lastSentAt && lastSentAt <= followUpCutoff) {
      dueFollowUp++;
    }
  }

  return (
    <div className="relative z-10 min-h-dvh">
      <AppHeader home="/dashboard" right={<SignOutButton />} />
      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <BackLink />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Instructor outreach
        </h1>
        <p className="mt-3 max-w-xl text-ink-soft">
          Your prospect pipeline. The agent drafts a personalised email for each
          prospect with an address on file — you review and approve every send.
          Each email identifies you and carries a one-click opt-out; anyone who
          opts out is suppressed automatically.
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

        {/* Agent panel */}
        <div className="mt-6 rounded-2xl border border-hairline bg-cream p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg font-bold text-ink">Outreach agent</p>
              <p className="text-sm text-ink-soft">
                {withEmail} with an email · {drafts.length} awaiting approval ·{" "}
                {sentCount} sent · {dueFollowUp} due a follow-up
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={generateDrafts}>
                <button
                  type="submit"
                  className="rounded-full bg-sea px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea-dark"
                >
                  Generate drafts
                </button>
              </form>
              <form action={generateFollowUps}>
                <button
                  type="submit"
                  disabled={dueFollowUp === 0}
                  className="rounded-full border border-sea px-4 py-2 text-sm font-semibold text-sea transition-colors hover:bg-sea/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate follow-ups{dueFollowUp > 0 ? ` (${dueFollowUp})` : ""}
                </button>
              </form>
            </div>
          </div>

          {withEmail === 0 && (
            <p className="mt-3 rounded-xl border border-line/40 bg-line/10 p-3 text-[13px] text-ink">
              No prospects have an email yet. Add an email to a prospect below
              (most listings only show a phone), then generate drafts.
            </p>
          )}

          {drafts.length > 0 && (
            <ul className="mt-4 space-y-3">
              {drafts.map((d) => (
                <li key={d.id} className="rounded-xl border border-hairline bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {d.prospect.name}
                      <span className="ml-2 font-normal text-ink-soft">
                        {d.prospect.email ?? "no email"}
                      </span>
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {d.prospect.emails.length > 0 && (
                        <span className="rounded-full bg-sea/15 px-2 py-0.5 text-xs font-semibold text-sea">
                          Follow-up
                        </span>
                      )}
                      {d.status === "FAILED" && (
                        <span className="rounded-full bg-signal/15 px-2 py-0.5 text-xs font-semibold text-signal">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                  {d.status === "FAILED" && d.error && (
                    <p className="mt-1 text-xs text-signal">{d.error}</p>
                  )}
                  <form className="mt-3 space-y-2">
                    <input name="subject" defaultValue={d.subject} className={`${field} w-full`} />
                    <textarea
                      name="body"
                      rows={9}
                      defaultValue={d.body}
                      className={`${field} w-full`}
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        formAction={updateDraft.bind(null, d.id)}
                        className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
                      >
                        Save
                      </button>
                      <button
                        formAction={sendDraft.bind(null, d.id)}
                        disabled={!d.prospect.email}
                        className="rounded-full bg-go px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-40"
                      >
                        Approve &amp; send
                      </button>
                      <button
                        formAction={discardDraft.bind(null, d.id)}
                        className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-signal"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {sent.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-semibold text-sea">
                Sent ({sentCount})
              </summary>
              <ul className="mt-2 space-y-1.5">
                {sent.map((s) => {
                  const st = sentStatus(s);
                  return (
                    <li
                      key={s.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="text-ink">{s.prospect.name}</span>
                      <span className={st.cls}>{st.label}</span>
                    </li>
                  );
                })}
              </ul>
            </details>
          )}
        </div>

        {/* Add prospect */}
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

        {/* Filters */}
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

        {/* Prospect list */}
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
                {p.lastContactedAt && (
                  <span className="text-ink-soft">
                    Last contacted {p.lastContactedAt.toLocaleDateString("en-GB")}
                  </span>
                )}
              </div>

              <form action={updateProspect.bind(null, p.id)} className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <select name="status" defaultValue={p.status} className={field}>
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <input
                    name="email"
                    type="email"
                    defaultValue={p.email ?? ""}
                    placeholder="Email (add to enable outreach)"
                    className={`${field} min-w-[14rem] flex-1`}
                  />
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

        {total > 0 && (
          <details className="mt-10 border-t border-hairline pt-6">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">
              Danger zone
            </summary>
            <div className="mt-4 rounded-2xl border border-signal/30 bg-signal/5 p-5">
              <p className="text-sm font-semibold text-ink">Reset the pipeline</p>
              <p className="mt-1 mb-3 max-w-md text-sm text-ink-soft">
                Deletes every prospect and their email history, so you can re-import
                a fresh list. There&rsquo;s no undo.
              </p>
              <ClearProspectsButton count={total} />
            </div>
          </details>
        )}
      </main>
    </div>
  );
}

function sentStatus(s: SentEmail): { label: string; cls: string } {
  const base = "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ";
  if (s.complainedAt) return { label: "Spam complaint", cls: base + "bg-signal/15 text-signal" };
  if (s.bouncedAt) return { label: "Bounced", cls: base + "bg-signal/15 text-signal" };
  if (s.openedAt) return { label: "Opened", cls: base + "bg-go/15 text-go" };
  if (s.deliveredAt) return { label: "Delivered", cls: base + "bg-sea/15 text-sea-dark" };
  return { label: "Sent", cls: base + "bg-line/20 text-ink" };
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
