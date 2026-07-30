"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Compass,
  MapPlus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import type { UserTripSummary } from "@/lib/trips/list-user-trips";
import { cn } from "@/lib/utils/cn";

type Tab = "owned" | "shared";

function roleLabel(role: UserTripSummary["role"]) {
  if (role === "owner") return "Owner";
  if (role === "EDITOR") return "Editor";
  return "Viewer";
}

function formatUpdated(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function TripCard({
  trip,
  index,
  deleting,
  confirmingDelete,
  deleteError,
  onToggleConfirm,
  onDelete,
}: {
  trip: UserTripSummary;
  index: number;
  deleting: boolean;
  confirmingDelete: boolean;
  deleteError: string | null;
  onToggleConfirm: (tripId: string) => void;
  onDelete: (tripId: string) => void;
}) {
  const meta = [
    `${trip.durationDays}d`,
    trip.totalDistanceKm != null
      ? `${Math.round(trip.totalDistanceKm).toLocaleString()} km`
      : null,
    trip.difficulty,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index, 6) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative"
    >
      <Link
        href={`/planner/${trip.id}`}
        className="block overflow-hidden rounded-3xl bg-card shadow-soft ring-1 ring-border/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-elevated hover:ring-primary/30 active:scale-[0.985]"
        aria-label={`Open trip ${trip.title}`}
      >
        <div className="relative aspect-[4/5] sm:aspect-[16/11]">
          {trip.coverPhotoUrl ? (
            <Image
              src={trip.coverPhotoUrl}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0 gradient-dawn"
            />
          )}

          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-foreground uppercase backdrop-blur-md">
                {trip.visibility}
              </span>
              {trip.role !== "owner" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[11px] font-medium text-primary-foreground backdrop-blur-md">
                  <Users className="size-3" />
                  {roleLabel(trip.role)}
                </span>
              ) : null}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4 sm:p-5">
            <p className="text-xs font-medium tracking-wide text-primary-foreground/75 uppercase">
              {meta}
            </p>
            <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-[1.65rem]">
              {trip.title}
            </h2>
            <p className="text-sm text-primary-foreground/70">
              Updated {formatUpdated(trip.updatedAt)}
            </p>
          </div>
        </div>
      </Link>

      {trip.role === "owner" ? (
        <div className="absolute top-3 right-3 z-10">
          <AnimatePresence mode="wait" initial={false}>
            {confirmingDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                className="flex max-w-[14rem] flex-col gap-2 rounded-2xl border border-border bg-background/95 p-2.5 shadow-elevated backdrop-blur-md"
              >
                <p className="px-1 text-xs leading-snug text-muted-foreground">
                  Delete this trip permanently?
                </p>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-8 flex-1 text-xs"
                    disabled={deleting}
                    onClick={() => onDelete(trip.id)}
                  >
                    {deleting ? "…" : "Delete"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2"
                    disabled={deleting}
                    onClick={() => onToggleConfirm(trip.id)}
                    aria-label="Cancel delete"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
                {deleteError ? (
                  <p className="px-1 text-xs text-destructive" role="alert">
                    {deleteError}
                  </p>
                ) : null}
              </motion.div>
            ) : (
              <motion.button
                key="trash"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                aria-label={`Delete ${trip.title}`}
                onClick={() => onToggleConfirm(trip.id)}
                className="grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-soft backdrop-blur-md transition hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </motion.article>
  );
}

export function MyTripsLibrary({ trips }: { trips: UserTripSummary[] }) {
  const [items, setItems] = useState(trips);
  const [tab, setTab] = useState<Tab>("owned");
  const [confirmingTripId, setConfirmingTripId] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const owned = items.filter((t) => t.role === "owner");
  const shared = items.filter((t) => t.role !== "owner");

  const activeTrips = tab === "owned" ? owned : shared;
  const showEmptyLibrary = items.length === 0;
  const showEmptyTab = !showEmptyLibrary && activeTrips.length === 0;

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
    <div className="relative min-h-screen overflow-x-hidden bg-background text-[17px]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_65%)]"
      />

      <SiteNav />

      <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12 sm:pb-16">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-primary">Library</p>
            <h1 className="mt-2 font-display text-[2.35rem] font-semibold tracking-tight sm:text-5xl">
              Your trips
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              {items.length === 0
                ? "Nothing saved yet — start a route."
                : `${items.length} itinerar${items.length === 1 ? "y" : "ies"} ready to open`}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="hidden shrink-0 rounded-full sm:inline-flex"
          >
            <Link href="/planner/new">
              <MapPlus className="size-4" />
              New trip
            </Link>
          </Button>
        </header>

        {!showEmptyLibrary ? (
          <div
            role="tablist"
            aria-label="Trip collections"
            className="mt-8 inline-flex w-full rounded-full border border-border bg-secondary/70 p-1 sm:w-auto"
          >
            {(
              [
                { id: "owned" as const, label: "Owned", count: owned.length },
                { id: "shared" as const, label: "Shared", count: shared.length },
              ] as const
            ).map((option) => {
              const selected = tab === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setTab(option.id);
                    setConfirmingTripId(null);
                    setDeleteError(null);
                  }}
                  className={cn(
                    "relative flex-1 rounded-full px-5 py-2.5 text-sm font-medium transition sm:flex-none",
                    selected
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                  <span
                    className={cn(
                      "ml-1.5 tabular-nums",
                      selected ? "text-primary" : "text-muted-foreground/80",
                    )}
                  >
                    {option.count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {showEmptyLibrary ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 overflow-hidden rounded-[1.75rem] border border-border bg-card/80 shadow-soft"
          >
            <div className="relative h-40 gradient-dawn sm:h-48">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(1_0_0/0.18),transparent_50%)]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="grid size-16 place-items-center rounded-full bg-background/15 text-primary-foreground backdrop-blur-md ring-1 ring-primary-foreground/20">
                  <Compass className="size-7" />
                </span>
              </div>
            </div>
            <div className="space-y-4 px-5 py-7 sm:px-8 sm:py-9">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Plan your first road trip
              </h2>
              <p className="max-w-md text-base text-muted-foreground">
                Build a blank itinerary or remix a public template. Everything
                you save lands here.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/planner/new">Start planning</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/discover">Browse templates</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : showEmptyTab ? (
          <div className="mt-12 rounded-3xl border border-dashed border-border px-5 py-12 text-center">
            <h2 className="font-display text-xl font-semibold">
              {tab === "owned" ? "No owned trips yet" : "Nothing shared with you"}
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-base text-muted-foreground">
              {tab === "owned"
                ? "Create a new itinerary or remix a template to fill this shelf."
                : "When someone invites you as a tripmate, it will show up here."}
            </p>
            {tab === "owned" ? (
              <Button asChild size="lg" className="mt-6 rounded-full">
                <Link href="/planner/new">
                  <MapPlus className="size-4" />
                  New trip
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {activeTrips.map((trip, index) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={index}
                  deleting={deletingTripId === trip.id}
                  confirmingDelete={confirmingTripId === trip.id}
                  deleteError={
                    confirmingTripId === trip.id ? deleteError : null
                  }
                  onToggleConfirm={onToggleConfirm}
                  onDelete={(tripId) => void onDelete(tripId)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Mobile FAB — app-style primary action */}
      <div className="fixed inset-x-0 bottom-0 z-40 p-4 sm:hidden">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/90 to-transparent" />
        <Button
          asChild
          size="lg"
          className="relative w-full rounded-full shadow-elevated"
        >
          <Link href="/planner/new">
            <MapPlus className="size-4" />
            New trip
          </Link>
        </Button>
      </div>
    </div>
  );
}
