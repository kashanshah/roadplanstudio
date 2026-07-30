import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/constants";
import { listPublicTrips } from "@/lib/trips/public";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Discover trips",
  description:
    "Browse public road-trip itineraries — featured loops, destinations, and templates ready to remix.",
  alternates: { canonical: `${SITE_URL}/discover` },
};

export default async function DiscoverPage() {
  let trips: Awaited<ReturnType<typeof listPublicTrips>> = [];
  try {
    trips = await listPublicTrips();
  } catch {
    trips = [];
  }

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Discover</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Public itineraries worth remixing.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Start from a seeded template or open any public trip. Sign in later to
          save your own version and invite tripmates.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {trips.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-lg text-muted-foreground">
                No public trips in the database yet. Seed Western Canada 2026,
                or browse the template page directly.
              </p>
              <Button asChild className="mt-6 text-base" size="lg">
                <Link href="/trips/western-canada-2026">
                  Western Canada Road Trip 2026
                </Link>
              </Button>
            </div>
          ) : (
            trips.map((trip) => (
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
            ))
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
