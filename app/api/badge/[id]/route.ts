import { get } from "@vercel/blob";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

// Streams a private badge image, but only to the owning instructor or an admin.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const profile = await prisma.instructorProfile.findUnique({
    where: { id },
    select: { userId: true, adiBadgeUrl: true },
  });
  if (!profile?.adiBadgeUrl) return new Response("Not found", { status: 404 });

  const isOwner = profile.userId === session.user.id;
  if (!isOwner) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    if (!isAdminEmail(me?.email)) return new Response("Forbidden", { status: 403 });
  }

  const result = await get(profile.adiBadgeUrl, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, no-cache",
    },
  });
}
