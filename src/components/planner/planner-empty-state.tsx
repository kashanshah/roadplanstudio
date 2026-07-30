"use client";

import Link from "next/link";
import { Compass, MapPlus, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RemixTripButton } from "@/components/trips/remix-trip-button";

type Props = {
  isLoggedIn: boolean;
  onStartBlank: () => void;
};

/** Optional starter — templates help, but blank planning is always available. */
export function PlannerEmptyState({ isLoggedIn, onStartBlank }: Props) {
  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div>
        <p className="eyebrow text-primary">Start your way</p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          Blank itinerary or a ready template
        </h2>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
          Build from scratch with Places search, or remix Western Canada and
          edit from there.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
            <MapPlus className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">Start blank</h3>
          <p className="mt-2 text-base text-muted-foreground">
            Open Day 1 and add stops with Google Places — no template required.
          </p>
          <Button
            type="button"
            size="lg"
            className="mt-5 text-base"
            onClick={onStartBlank}
          >
            Plan from scratch
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
            <Route className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">Remix Western Canada</h3>
          <p className="mt-2 text-base text-muted-foreground">
            Copy the 13-day seeded itinerary with real Places data, then tweak
            it.
          </p>
          <div className="mt-5">
            <RemixTripButton slug="western-canada-2026" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4 text-base">
        <Compass className="h-4 w-4 text-primary" />
        <Link
          href="/discover"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse public trips
        </Link>
        {!isLoggedIn ? (
          <>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/auth/login?next=/planner/new"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
