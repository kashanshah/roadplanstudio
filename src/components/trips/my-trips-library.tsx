import Image from "next/image";
import Link from "next/link";
import { MapPlus, Users } from "lucide-react";
import { SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import type { UserTripSummary } from "@/lib/trips/list-user-trips";

function roleLabel(role: UserTripSummary["role"]) {
  if (role === "owner") return "Owner";
  if (role === "EDITOR") return "Editor";
  return "Viewer";
}

function formatUpdated(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function TripRow({ trip }: { trip: UserTripSummary }) {
  const meta = [
    `${trip.durationDays} day${trip.durationDays === 1 ? "" : "s"}`,
    trip.totalDistanceKm != null
      ? `~${Math.round(trip.totalDistanceKm).toLocaleString()} km`
      : null,
    trip.difficulty,
    trip.visibility,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/planner/${trip.id}`}
      className="group flex gap-4 border-t border-border py-5 transition-colors first:border-t-0 hover:border-primary sm:gap-5"
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden bg-spruce sm:h-24 sm:w-36">
        {trip.coverPhotoUrl ? (
          <Image
            src={trip.coverPhotoUrl}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="144px"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(140deg,oklch(0.174_0.012_175.5)_0%,oklch(0.42_0.05_175)_100%)]"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-semibold tracking-tight group-hover:text-primary sm:text-2xl">
            {trip.title}
          </h2>
          {trip.role !== "owner" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              <Users className="size-3" />
              {roleLabel(trip.role)}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm tracking-wide text-muted-foreground uppercase">
          {meta}
        </p>
        {trip.description ? (
          <p className="mt-2 line-clamp-2 text-base text-muted-foreground">
            {trip.description}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">
          Updated {formatUpdated(trip.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

export function MyTripsLibrary({ trips }: { trips: UserTripSummary[] }) {
  const owned = trips.filter((t) => t.role === "owner");
  const shared = trips.filter((t) => t.role !== "owner");

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-primary">Planner</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Your trips
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Open a saved itinerary, jump into a shared trip, or start a new
              route from scratch.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0 self-start sm:self-auto">
            <Link href="/planner/new">
              <MapPlus className="size-4" />
              New trip
            </Link>
          </Button>
        </div>

        {trips.length === 0 ? (
          <div className="mt-14 border-t border-border pt-10">
            <h2 className="font-display text-2xl font-semibold">No trips yet</h2>
            <p className="mt-3 max-w-lg text-base text-muted-foreground">
              Start a blank itinerary or remix a public template — everything
              you save will show up here.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/planner/new">Start planning</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/discover">Browse templates</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {owned.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Owned · {owned.length}
                </h2>
                <div className="mt-4">
                  {owned.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))}
                </div>
              </section>
            ) : null}
            {shared.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Shared with you · {shared.length}
                </h2>
                <div className="mt-4">
                  {shared.map((trip) => (
                    <TripRow key={trip.id} trip={trip} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
