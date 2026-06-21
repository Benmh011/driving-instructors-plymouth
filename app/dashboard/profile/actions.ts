"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueInstructorSlug } from "@/lib/slug";
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
    carMake: formData.get("carMake") || undefined,
    carModel: formData.get("carModel") || undefined,
    carYear: formData.get("carYear") || undefined,
    carColour: formData.get("carColour") || undefined,
    carDetails: formData.get("carDetails") || undefined,
    bio: formData.get("bio") || undefined,
    cancellationNoticeHours: formData.get("cancellationNoticeHours"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const d = parsed.data;

  // Backfill a slug for older profiles that predate slugs. Kept stable once set.
  let slugPatch: { slug?: string } = {};
  if (!instructor.slug) {
    const u = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    slugPatch = {
      slug: await uniqueInstructorSlug(d.businessName || u?.name || "instructor", instructor.id),
    };
  }

  await prisma.instructorProfile.update({
    where: { id: instructor.id },
    data: {
      businessName: d.businessName ?? null,
      postcodes: d.postcodes,
      transmission: d.transmission,
      hourlyRate: d.hourlyRate,
      carMake: d.carMake ?? null,
      carModel: d.carModel ?? null,
      carYear: d.carYear ?? null,
      carColour: d.carColour ?? null,
      carDetails: d.carDetails ?? null,
      bio: d.bio ?? null,
      cancellationNoticeHours: d.cancellationNoticeHours,
      ...slugPatch,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  redirect("/dashboard");
}

// Saves the public Blob URL of a freshly uploaded profile photo.
export async function savePhoto(url: string) {
  const session = await auth();
  if (!session?.user?.id) return;
  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, photoUrl: true },
  });
  if (!instructor) return;
  if (typeof url !== "string" || !url.startsWith("https://")) return;

  // Best-effort cleanup of the previous photo.
  if (instructor.photoUrl && instructor.photoUrl !== url) {
    await del(instructor.photoUrl).catch(() => {});
  }

  await prisma.instructorProfile.update({
    where: { id: instructor.id },
    data: { photoUrl: url },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/instructors");
  revalidatePath("/instructors/[id]", "page");
}

// Removes the current profile photo.
export async function removePhoto() {
  const session = await auth();
  if (!session?.user?.id) return;
  const instructor = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, photoUrl: true },
  });
  if (!instructor) return;

  if (instructor.photoUrl) {
    await del(instructor.photoUrl).catch(() => {});
  }
  await prisma.instructorProfile.update({
    where: { id: instructor.id },
    data: { photoUrl: null },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/instructors");
  revalidatePath("/instructors/[id]", "page");
}
