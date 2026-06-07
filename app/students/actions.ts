"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Flip the instructor's "taking new students" availability.
export async function toggleAccepting() {
  const session = await auth();
  if (!session?.user?.id) return;

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return;

  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: { acceptingStudents: !profile.acceptingStudents },
  });

  revalidatePath("/students");
}
