"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { SITE_URL } from "@/lib/constants";
import { SEED_PROSPECTS } from "@/lib/outreach/seed";
import { sendOutreachEmail } from "@/lib/outreach/email";
import {
  buildDraft,
  buildFollowUp,
  withUnsubscribeFooter,
  FOLLOWUP_AFTER_DAYS,
  MAX_TOUCHES,
} from "@/lib/outreach/draft";

const STATUSES = [
  "NEW",
  "CONTACTED",
  "REPLIED",
  "DEMO",
  "SIGNED_UP",
  "NOT_INTERESTED",
  "DO_NOT_CONTACT",
];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  return isAdminEmail(me?.email);
}

export async function importSeedProspects() {
  if (!(await requireAdmin())) return;
  await prisma.prospect.createMany({
    data: SEED_PROSPECTS.map((p) => ({
      name: p.name,
      area: p.area,
      phone: p.phone ?? null,
      website: p.website ?? null,
      googlePlaceId: p.googlePlaceId,
      rating: p.rating ?? null,
      notes: p.notes ?? null,
      source: "places",
    })),
    skipDuplicates: true, // dedupes on unique googlePlaceId
  });
  revalidatePath("/admin/outreach");
}

export async function addProspect(formData: FormData) {
  if (!(await requireAdmin())) return;
  const name = ((formData.get("name") as string | null) ?? "").trim();
  if (!name) return;
  await prisma.prospect.create({
    data: {
      name,
      area: ((formData.get("area") as string | null) ?? "").trim() || null,
      phone: ((formData.get("phone") as string | null) ?? "").trim() || null,
      email: ((formData.get("email") as string | null) ?? "").trim() || null,
      website: ((formData.get("website") as string | null) ?? "").trim() || null,
      source: "manual",
    },
  });
  revalidatePath("/admin/outreach");
}

export async function updateProspect(id: string, formData: FormData) {
  if (!(await requireAdmin())) return;
  const status = (formData.get("status") as string | null) ?? "NEW";
  if (!STATUSES.includes(status)) return;
  const notes = ((formData.get("notes") as string | null) ?? "").trim() || null;

  const data: {
    status: string;
    notes: string | null;
    lastContactedAt?: Date;
    email?: string | null;
  } = {
    status,
    notes,
    lastContactedAt: status === "CONTACTED" ? new Date() : undefined,
  };
  if (formData.has("email")) {
    data.email = ((formData.get("email") as string | null) ?? "").trim() || null;
  }

  await prisma.prospect.update({ where: { id }, data });
  revalidatePath("/admin/outreach");
}

export async function deleteProspect(id: string) {
  if (!(await requireAdmin())) return;
  await prisma.prospect.delete({ where: { id } });
  revalidatePath("/admin/outreach");
}

// Wipe the whole prospect list (and, by cascade, every draft/sent email).
// Used to clear the seed data and start fresh. Type-to-confirm in the UI.
export async function clearAllProspects(): Promise<{ cleared?: number; error?: string }> {
  if (!(await requireAdmin())) return { error: "Not authorised." };
  const { count } = await prisma.prospect.deleteMany({});
  revalidatePath("/admin/outreach");
  return { cleared: count };
}

// --- Outreach agent: drafts, approval, sending ---

// Create a draft email for every prospect that has an email, is still NEW, and
// doesn't already have a live draft or a sent email. Stale failed attempts are
// cleared so they don't block regeneration. Nothing is sent here.
export async function generateDrafts() {
  if (!(await requireAdmin())) return;
  const prospects = await prisma.prospect.findMany({
    where: {
      status: "NEW",
      email: { not: null },
      emails: { none: { status: { in: ["DRAFT", "SENT"] } } },
    },
    select: { id: true, name: true, area: true },
  });
  for (const p of prospects as { id: string; name: string; area: string | null }[]) {
    await prisma.outreachEmail.deleteMany({
      where: { prospectId: p.id, status: "FAILED" },
    });
    const { subject, body } = buildDraft(p);
    await prisma.outreachEmail.create({
      data: { prospectId: p.id, subject, body },
    });
  }
  revalidatePath("/admin/outreach");
}

// Create a follow-up draft for every CONTACTED prospect whose last email went
// out at least FOLLOWUP_AFTER_DAYS ago, who hasn't replied or been ruled out,
// who hasn't hit MAX_TOUCHES, and who has no draft already waiting. Nothing
// sends here — they land in the same approval queue as first-contact drafts.
export async function generateFollowUps() {
  if (!(await requireAdmin())) return;
  const cutoff = new Date(Date.now() - FOLLOWUP_AFTER_DAYS * 24 * 60 * 60 * 1000);

  const prospects = await prisma.prospect.findMany({
    where: {
      status: "CONTACTED",
      email: { not: null },
      emails: { some: { status: "SENT" }, none: { status: "DRAFT" } },
    },
    select: {
      id: true,
      name: true,
      area: true,
      emails: {
        where: { status: "SENT" },
        select: { sentAt: true },
        orderBy: { sentAt: "desc" },
      },
    },
  });

  for (const p of prospects as {
    id: string;
    name: string;
    area: string | null;
    emails: { sentAt: Date | null }[];
  }[]) {
    const sentCount = p.emails.length;
    const lastSentAt = p.emails[0]?.sentAt;
    if (sentCount >= MAX_TOUCHES) continue; // enough touches already
    if (!lastSentAt || lastSentAt > cutoff) continue; // contacted too recently
    const { subject, body } = buildFollowUp(
      { name: p.name, area: p.area },
      sentCount + 1,
    );
    await prisma.outreachEmail.create({ data: { prospectId: p.id, subject, body } });
  }

  revalidatePath("/admin/outreach");
}

export async function updateDraft(id: string, formData: FormData) {
  if (!(await requireAdmin())) return;
  const subject = ((formData.get("subject") as string | null) ?? "").trim();
  const body = ((formData.get("body") as string | null) ?? "").trim();
  if (!subject || !body) return;
  await prisma.outreachEmail.update({
    where: { id },
    data: { subject, body },
  });
  revalidatePath("/admin/outreach");
}

export async function discardDraft(id: string) {
  if (!(await requireAdmin())) return;
  await prisma.outreachEmail.deleteMany({ where: { id, status: { not: "SENT" } } });
  revalidatePath("/admin/outreach");
}

// Approve + send a single draft. Auto-marks the prospect Contacted on success.
// Persists any inline subject/body edits first.
export async function sendDraft(id: string, formData?: FormData) {
  if (!(await requireAdmin())) return;

  if (formData) {
    const subject = ((formData.get("subject") as string | null) ?? "").trim();
    const body = ((formData.get("body") as string | null) ?? "").trim();
    if (subject && body) {
      await prisma.outreachEmail.updateMany({
        where: { id, status: { not: "SENT" } },
        data: { subject, body },
      });
    }
  }

  const draft = await prisma.outreachEmail.findUnique({
    where: { id },
    include: { prospect: true },
  });
  if (!draft || draft.status === "SENT") return;

  const p = draft.prospect;
  if (!p.email || p.status === "DO_NOT_CONTACT") return;

  let token: string | null = p.unsubscribeToken;
  if (!token) {
    token = randomUUID();
    await prisma.prospect.update({
      where: { id: p.id },
      data: { unsubscribeToken: token },
    });
  }
  const unsubscribeUrl = `${SITE_URL}/api/outreach/unsubscribe?token=${token}`;
  const text = withUnsubscribeFooter(draft.body, unsubscribeUrl);

  try {
    const resendId = await sendOutreachEmail({
      to: p.email,
      subject: draft.subject,
      text,
      unsubscribeUrl,
    });
    await prisma.outreachEmail.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), resendId, error: null },
    });
    await prisma.prospect.update({
      where: { id: p.id },
      data: { status: "CONTACTED", lastContactedAt: new Date() },
    });
  } catch (e) {
    await prisma.outreachEmail.update({
      where: { id },
      data: { status: "FAILED", error: e instanceof Error ? e.message : String(e) },
    });
  }
  revalidatePath("/admin/outreach");
}
