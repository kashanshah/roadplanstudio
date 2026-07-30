import type { MetadataRoute } from "next";
import { blogPosts } from "@/data/blog/posts";
import { destinationRegions } from "@/data/destinations/regions";
import { tripTemplates } from "@/data/trips/templates";
import { SITE_URL } from "@/lib/constants";
import { defaultLocale, locales, localizedPath } from "@/lib/i18n/config";

const marketingPaths = [
  "/",
  "/discover",
  "/destinations",
  "/blog",
  "/features",
  "/pricing",
  "/about",
  "/contact",
  "/request-feature",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of marketingPaths) {
      entries.push({
        url: `${SITE_URL}${localizedPath(locale, path)}`,
        lastModified: new Date("2026-07-30"),
        changeFrequency: path === "/" || path === "/discover" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/discover" ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}${localizedPath(l, path)}`]),
          ),
        },
      });
    }
  }

  for (const trip of tripTemplates) {
    const path = `/trips/${trip.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date("2026-07-30"),
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: {
        languages: Object.fromEntries(
          [defaultLocale, ...locales.filter((l) => l !== defaultLocale)].map(
            (l) => [l, `${SITE_URL}${localizedPath(l, path)}`],
          ),
        ),
      },
    });
  }

  for (const region of destinationRegions) {
    const path = `/destinations/${region.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: new Date("2026-07-30"),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const post of blogPosts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.75,
    });
  }

  return entries;
}
