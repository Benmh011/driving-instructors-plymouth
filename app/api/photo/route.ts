import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Receives a (browser-resized) image and stores it as a public Blob.
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, photoUrl: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Not an instructor account" }, { status: 403 });
  }

  let file: unknown;
  try {
    const form = await request.formData();
    file = form.get("file");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No image received" }, { status: 400 });
  }
  // Resized client-side, so this should be small. Guard anyway.
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });
  }

  let url: string;
  try {
    const blob = await put(`profile-photos/${profile.id}.jpg`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
      contentType: "image/jpeg",
    });
    url = blob.url;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }

  // Clean up the previous photo, then save the new URL.
  if (profile.photoUrl && profile.photoUrl !== url) {
    await del(profile.photoUrl).catch(() => {});
  }
  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: { photoUrl: url },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/instructors");
  revalidatePath("/instructors/[id]", "page");

  return NextResponse.json({ url });
}
