import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE } from "@/lib/site";
import { accessState, hasFullAccess } from "@/lib/subscription";

// Rebuild the sitemap at most once a day.
export const revalidate = 86400;

type InstructorRow = {
  id: string;
  slug: string | null;
  updatedAt: Date;
  subscriptionStatus: string | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE}/instructors`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/acceptable-use`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  let instructorEntries: MetadataRoute.Sitemap = [];
  try {
    // Mirror the public directory: verified, onboarded, not deleted/anonymised,
    // and on an active/trialing/grace subscription (search is a paid feature).
    const listed = await prisma.instructorProfile.findMany({
      where: {
        user: {
          onboardingComplete: true,
          deletionScheduledFor: null,
          anonymizedAt: null,
        },
        adiStatus: "VERIFIED",
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      },
    });

    instructorEntries = listed
      .filter((i: InstructorRow) => hasFullAccess(accessState(i)))
      .map((i: InstructorRow) => ({
        url: `${SITE}/instructors/${i.slug ?? i.id}`,
        lastModified: i.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    // If the database is unreachable, still return the static map.
    instructorEntries = [];
  }

  return [...staticEntries, ...instructorEntries];
}
