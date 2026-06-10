import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Receives a (browser-resized) image and stores it as a private Blob.
// It's served publicly via /api/instructor-photo/[id].
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
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });
  }

  let pathname: string;
  try {
    const blob = await put(`profile-photos/${profile.id}.jpg`, file, {
      access: "private",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
      contentType: "image/jpeg",
    });
    pathname = blob.pathname;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 },
    );
  }

  // Remove the previous photo (best-effort), then save the new pathname.
  if (profile.photoUrl && profile.photoUrl !== pathname) {
    await del(profile.photoUrl, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(
      () => {},
    );
  }
  await prisma.instructorProfile.update({
    where: { id: profile.id },
    data: { photoUrl: pathname },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/instructors");
  revalidatePath("/instructors/[id]", "page");

  return NextResponse.json({ ok: true });
}
