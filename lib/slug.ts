import { prisma } from "@/lib/prisma";

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "instructor";
}

// A slug unique across instructors. Pass the profile's own id so updating an
// existing profile doesn't collide with itself.
export async function uniqueInstructorSlug(
  name: string,
  ignoreId?: string,
): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 1;
  for (;;) {
    const existing = await prisma.instructorProfile.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === ignoreId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

// Returns the profile's slug, generating + persisting one if it's missing.
export async function ensureInstructorSlug(p: {
  id: string;
  slug: string | null;
  businessName: string | null;
  user: { name: string };
}): Promise<string> {
  if (p.slug) return p.slug;
  const slug = await uniqueInstructorSlug(p.businessName || p.user.name, p.id);
  try {
    await prisma.instructorProfile.update({ where: { id: p.id }, data: { slug } });
  } catch {
    /* a concurrent request may have set it; the slug value is still usable */
  }
  return slug;
}
