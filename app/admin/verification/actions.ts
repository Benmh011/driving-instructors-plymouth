"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  return isAdminEmail(user?.email);
}

export async function verifyInstructor(profileId: string) {
  if (!(await requireAdmin())) return;
  await prisma.instructorProfile.update({
    where: { id: profileId },
    data: { adiStatus: "VERIFIED", adiReviewedAt: new Date() },
  });
  revalidatePath("/admin/verification");
}

export async function rejectInstructor(profileId: string) {
  if (!(await requireAdmin())) return;
  await prisma.instructorProfile.update({
    where: { id: profileId },
    data: { adiStatus: "REJECTED", adiReviewedAt: new Date() },
  });
  revalidatePath("/admin/verification");
}
