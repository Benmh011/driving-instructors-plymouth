import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the signed-in app, admin tools and API out of search results.
      disallow: [
        "/dashboard",
        "/diary",
        "/messages",
        "/students",
        "/account",
        "/onboarding",
        "/credit",
        "/theory",
        "/admin",
        "/api/",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
