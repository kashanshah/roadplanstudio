import { blogPosts } from "@/data/blog/posts";
import { destinationRegions } from "@/data/destinations/regions";
import { tripTemplates } from "@/data/trips/templates";
import { SITE_URL } from "@/lib/constants";
import { locales, localizedPath } from "@/lib/i18n/config";

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapEntry = {
  url: string;
  lastModified: string;
  changeFrequency: SitemapChangeFrequency;
  priority: number;
  alternates?: Record<string, string>;
  group: "marketing" | "trips" | "destinations" | "blog";
};

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
  "/legal",
  "/privacy",
  "/terms",
  "/cookies",
  "/acceptable-use",
  "/copyright",
] as const;

function isoDate(value: string | Date) {
  const d = value instanceof Date ? value : new Date(value);
  return d.toISOString().slice(0, 10);
}

export function getSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  for (const locale of locales) {
    for (const path of marketingPaths) {
      entries.push({
        url: `${SITE_URL}${localizedPath(locale, path)}`,
        lastModified: isoDate("2026-07-30"),
        changeFrequency:
          path === "/" || path === "/discover" ? "weekly" : "monthly",
        priority: path === "/" ? 1 : path === "/discover" ? 0.9 : 0.7,
        alternates: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}${localizedPath(l, path)}`]),
        ),
        group: "marketing",
      });
    }
  }

  for (const trip of tripTemplates) {
    const path = `/trips/${trip.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: isoDate("2026-07-30"),
      changeFrequency: "monthly",
      priority: 0.85,
      alternates: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}${localizedPath(l, path)}`]),
      ),
      group: "trips",
    });
  }

  for (const region of destinationRegions) {
    const path = `/destinations/${region.slug}`;
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: isoDate("2026-07-30"),
      changeFrequency: "monthly",
      priority: 0.8,
      group: "destinations",
    });
  }

  for (const post of blogPosts) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: isoDate(post.updatedAt),
      changeFrequency: "monthly",
      priority: 0.75,
      group: "blog",
    });
  }

  // Prefer English home first for humans reading the styled view
  return entries.sort((a, b) => {
    if (a.url === `${SITE_URL}/`) return -1;
    if (b.url === `${SITE_URL}/`) return 1;
    return b.priority - a.priority || a.url.localeCompare(b.url);
  });
}
