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

function TripRow({
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
    <div className="border-t border-border py-5 first:border-t-0">
      <div className="group flex gap-4 transition-colors hover:border-primary sm:gap-5">
        <Link
          href={`/planner/${trip.id}`}
          className="contents"
          aria-label={`Open trip ${trip.title}`}
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
      </div>
      {trip.role === "owner" ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          {confirmingDelete ? (
            <>
              <p className="text-sm text-muted-foreground">
                Delete this trip permanently?
              </p>
              <div className="flex w-full gap-2 sm:w-auto">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                  disabled={deleting}
                  onClick={() => onDelete(trip.id)}
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="flex-1 sm:flex-none"
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
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
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
          <div className="mt-12 space-y-12">
            {owned.length > 0 ? (
              <section>
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Owned · {owned.length}
                </h2>
                <div className="mt-4">
                  {owned.map((trip) => (
                    <TripRow
                      key={trip.id}
                      trip={trip}
                      deleting={deletingTripId === trip.id}
                      confirmingDelete={confirmingTripId === trip.id}
                      deleteError={confirmingTripId === trip.id ? deleteError : null}
                      onToggleConfirm={onToggleConfirm}
                      onDelete={(tripId) => void onDelete(tripId)}
                    />
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
                    <TripRow
                      key={trip.id}
                      trip={trip}
                      deleting={false}
                      confirmingDelete={false}
                      deleteError={null}
                      onToggleConfirm={() => {}}
                      onDelete={() => {}}
                    />
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
