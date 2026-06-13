"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";
import { SEED_PROSPECTS } from "@/lib/outreach/seed";

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
  await prisma.prospect.update({
    where: { id },
    data: {
      status,
      notes,
      lastContactedAt: status === "CONTACTED" ? new Date() : undefined,
    },
  });
  revalidatePath("/admin/outreach");
}

export async function deleteProspect(id: string) {
  if (!(await requireAdmin())) return;
  await prisma.prospect.delete({ where: { id } });
  revalidatePath("/admin/outreach");
}
