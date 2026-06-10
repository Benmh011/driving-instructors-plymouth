"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueInstructorSlug } from "@/lib/slug";
import { learnerSchema, instructorSchema } from "@/lib/validators";

export type ActionState = { error?: string } | undefined;

export async function completeLearner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = learnerSchema.safeParse({
    postcode: formData.get("postcode"),
    transmission: formData.get("transmission"),
    goal: formData.get("goal") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  }

  const userId = session.user.id;
  const { postcode, transmission, goal } = parsed.data;

  await prisma.$transaction([
    prisma.learnerProfile.upsert({
      where: { userId },
      create: { userId, postcode, transmission, goal },
      update: { postcode, transmission, goal },
    }),
    prisma.user.update({ where: { id: userId }, data: { onboardingComplete: true } }),
  ]);

  redirect("/dashboard");
}

export async function completeInstructor(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = instructorSchema.safeParse({
    adiNumber: formData.get("adiNumber"),
    businessName: formData.get("businessName") || undefined,
    postcodes: formData.get("postcodes"),
    transmission: formData.get("transmission"),
    hourlyRate: formData.get("hourlyRate"),
    carDetails: formData.get("carDetails") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your answers." };
  }

  const userId = session.user.id;
  const data = parsed.data;

  // Give the public profile a stable, SEO-friendly slug.
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  const slug = await uniqueInstructorSlug(data.businessName || currentUser?.name || "instructor");

  await prisma.$transaction([
    prisma.instructorProfile.upsert({
      where: { userId },
      create: { userId, slug, ...data },
      update: { ...data },
    }),
    prisma.user.update({ where: { id: userId }, data: { onboardingComplete: true } }),
  ]);

  redirect("/dashboard");
}
