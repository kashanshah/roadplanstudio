import type { Metadata } from "next";
import Link from "next/link";
import { TripTemplateCard } from "@/components/trips/trip-template-card";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { tripTemplates } from "@/data/trips/templates";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listPublicTrips } from "@/lib/trips/public";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/discover",
    "Discover road trip itineraries",
    "Browse public road-trip templates across North America, Europe, Asia, Oceania, South America and Africa — ready to remix.",
  ),
  keywords: [
    "road trip itineraries",
    "road trip templates",
    "international road trips",
    "discover trips",
  ],
};

export default async function DiscoverPage() {
  const dict = getDictionary("en");
  let dbTrips: Awaited<ReturnType<typeof listPublicTrips>> = [];
  try {
    dbTrips = await listPublicTrips();
  } catch {
    dbTrips = [];
  }

  const templateSlugs = new Set(tripTemplates.map((t) => t.slug));
  const extraDb = dbTrips.filter((t) => t.slug && !templateSlugs.has(t.slug));

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Discover</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.discover.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.discover.body}
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {tripTemplates.map((trip) => (
            <TripTemplateCard key={trip.slug} trip={trip} locale="en" />
          ))}
          {extraDb.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.slug}`}
              className="group block border-t border-border pt-5 transition hover:border-primary"
            >
              <p className="text-sm tracking-widest text-muted-foreground uppercase">
                {trip.durationDays} days
                {trip.totalDistanceKm
                  ? ` · ~${Math.round(trip.totalDistanceKm).toLocaleString()} km`
                  : ""}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold group-hover:text-primary">
                {trip.title}
              </h2>
              {trip.description ? (
                <p className="mt-2 line-clamp-3 text-base text-muted-foreground">
                  {trip.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
