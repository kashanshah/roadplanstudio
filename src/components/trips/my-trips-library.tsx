"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MapPlus, Trash2, Users } from "lucide-react";
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

function TripCard({
  trip,
  deleting,
  confirmingDelete,
  deleteError,
  onToggleConfirm,
  onDelete,
}: {
  trip: UserTripSummary;
  deleting: boolean;
  confirmingDelete: boolean;
  deleteError: string | null;
  onToggleConfirm: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}) {
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
    <article className="flex h-full flex-col border-t border-border pt-5 transition-colors hover:border-primary">
      <Link
        href={`/planner/${trip.id}`}
        className="group flex min-h-0 flex-1 flex-col"
        aria-label={`Open trip ${trip.title}`}
      >
        <div className="relative mb-4 aspect-[16/10] overflow-hidden bg-spruce">
          {trip.coverPhotoUrl ? (
            <Image
              src={trip.coverPhotoUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(140deg,oklch(0.174_0.012_175.5)_0%,oklch(0.42_0.05_175)_100%)]"
            />
          )}
        </div>

        <p className="text-sm tracking-widest text-muted-foreground uppercase">
          {meta}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-2xl font-semibold tracking-tight group-hover:text-primary">
            {trip.title}
          </h2>
          {trip.role !== "owner" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              <Users className="size-3" />
              {roleLabel(trip.role)}
            </span>
          ) : null}
        </div>

        {trip.description ? (
          <p className="mt-2 line-clamp-2 text-base text-muted-foreground">
            {trip.description}
          </p>
        ) : null}

        <p className="mt-3 text-sm text-muted-foreground">
          Updated {formatUpdated(trip.updatedAt)}
        </p>
      </Link>

      {trip.role === "owner" ? (
        <div className="mt-4 flex flex-col gap-2 border-t border-border/70 pt-3">
          {confirmingDelete ? (
            <>
              <p className="text-sm text-muted-foreground">
                Delete this trip permanently?
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  disabled={deleting}
                  onClick={() => onDelete(trip.id)}
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  disabled={deleting}
                  onClick={() => onToggleConfirm(trip.id)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full justify-start px-0 text-destructive hover:bg-transparent hover:text-destructive"
              onClick={() => onToggleConfirm(trip.id)}
            >
              <Trash2 className="size-4" />
              Delete trip
            </Button>
          )}
          {deleteError ? (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function TripGrid({
  trips,
  deletingTripId,
  confirmingTripId,
  deleteError,
  onToggleConfirm,
  onDelete,
  allowDelete,
}: {
  trips: UserTripSummary[];
  deletingTripId: string | null;
  confirmingTripId: string | null;
  deleteError: string | null;
  onToggleConfirm: (tripId: string) => void;
  onDelete: (tripId: string) => void;
  allowDelete: boolean;
}) {
  return (
    <div className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          deleting={allowDelete && deletingTripId === trip.id}
          confirmingDelete={allowDelete && confirmingTripId === trip.id}
          deleteError={
            allowDelete && confirmingTripId === trip.id ? deleteError : null
          }
          onToggleConfirm={onToggleConfirm}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function MyTripsLibrary({ trips }: { trips: UserTripSummary[] }) {
  const [items, setItems] = useState(trips);
  const [confirmingTripId, setConfirmingTripId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const owned = items.filter((t) => t.role === "owner");
  const shared = items.filter((t) => t.role !== "owner");

  function onToggleConfirm(tripId: string) {
    setDeleteError(null);
    setConfirmingTripId((prev) => (prev === tripId ? null : tripId));
  }

  async function onDelete(tripId: string) {
    setDeleteError(null);
    setDeletingTripId(tripId);
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleteError("Could not delete this trip. Please try again.");
        return;
      }
      setItems((prev) => prev.filter((trip) => trip.id !== tripId));
      setConfirmingTripId(null);
    } finally {
      setDeletingTripId(null);
    }
  }

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

        {items.length === 0 ? (
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
          <div className="mt-12 space-y-14">
            {owned.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Owned · {owned.length}
                </h2>
                <TripGrid
                  trips={owned}
                  deletingTripId={deletingTripId}
                  confirmingTripId={confirmingTripId}
                  deleteError={deleteError}
                  onToggleConfirm={onToggleConfirm}
                  onDelete={(tripId) => void onDelete(tripId)}
                  allowDelete
                />
              </section>
            ) : null}
            {shared.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Shared with you · {shared.length}
                </h2>
                <TripGrid
                  trips={shared}
                  deletingTripId={null}
                  confirmingTripId={null}
                  deleteError={null}
                  onToggleConfirm={() => {}}
                  onDelete={() => {}}
                  allowDelete={false}
                />
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
