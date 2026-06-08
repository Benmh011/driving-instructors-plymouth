"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { instructorProfileSchema } from "@/lib/validators";

export type ActionState = { error?: string } | undefined;

export async function updateInstructorProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!instructor) redirect("/dashboard");

  const parsed = instructorProfileSchema.safeParse({
    businessName: formData.get("businessName") || undefined,
    postcodes: formData.get("postcodes"),
    transmission: formData.get("transmission"),
    hourlyRate: formData.get("hourlyRate"),
    carDetails: formData.get("carDetails") || undefined,
    bio: formData.get("bio") || undefined,
    cancellationNoticeHours: formData.get("cancellationNoticeHours"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const d = parsed.data;
  await prisma.instructorProfile.update({
    where: { id: instructor.id },
    data: {
      businessName: d.businessName ?? null,
      postcodes: d.postcodes,
      transmission: d.transmission,
      hourlyRate: d.hourlyRate,
      carDetails: d.carDetails ?? null,
      bio: d.bio ?? null,
      cancellationNoticeHours: d.cancellationNoticeHours,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  redirect("/dashboard");
}
