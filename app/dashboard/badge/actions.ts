"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Persist the uploaded badge's blob pathname and send the instructor back into review.
export async function saveBadge(pathname: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Only accept paths our uploader produces.
  if (!pathname.startsWith("badges/")) return;

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return;

  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: { adiBadgeUrl: pathname, adiStatus: "PENDING", adiReviewedAt: null },
  });

  revalidatePath("/dashboard/badge");
  revalidatePath("/admin/verification");
}
