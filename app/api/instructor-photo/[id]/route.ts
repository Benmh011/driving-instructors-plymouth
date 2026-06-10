import { get } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// Streams an instructor's profile photo to anyone (it's public-facing).
// The blob lives in a private store, so we proxy it here.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const profile = await prisma.instructorProfile.findUnique({
    where: { id },
    select: { photoUrl: true },
  });
  if (!profile?.photoUrl) return new Response("Not found", { status: 404 });

  const result = await get(profile.photoUrl, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  if (!result || result.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      // The URL carries a ?v= cache-buster that changes on every new upload,
      // so each version can be cached hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
