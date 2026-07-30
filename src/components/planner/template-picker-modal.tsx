"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Compass, X } from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { RemixTripButton } from "@/components/trips/remix-trip-button";
import { tripTemplates } from "@/data/trips/templates";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function TemplatePickerModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close template picker"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full overflow-hidden rounded-t-3xl border border-border bg-background shadow-elevated sm:max-w-3xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
              Start from a base trip
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">
              Choose a template
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            {...tip("Close")}
            className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          {tripTemplates.map((trip) => (
            <article
              key={trip.slug}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="text-lg font-semibold">{trip.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{trip.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {trip.durationDays} days · ~
                {trip.totalDistanceKm.toLocaleString()} km
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <RemixTripButton slug={trip.slug} fullWidthOnMobile />
                <Link
                  href={`/trips/${trip.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Preview
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-3 text-sm text-muted-foreground sm:px-6">
          <Compass className="size-4 text-primary" />
          <Link
            href="/discover"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Browse all discover trips
          </Link>
        </div>
      </div>
    </div>
  );
}
