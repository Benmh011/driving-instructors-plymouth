"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });
  return isAdminEmail(me?.email);
}

export async function setFeedbackResolved(id: string, resolved: boolean) {
  if (!(await requireAdmin())) return;
  await prisma.theoryFeedback.update({ where: { id }, data: { resolved } });
  revalidatePath("/admin/theory");
}

export async function deleteFeedback(id: string) {
  if (!(await requireAdmin())) return;
  await prisma.theoryFeedback.delete({ where: { id } });
  revalidatePath("/admin/theory");
}
