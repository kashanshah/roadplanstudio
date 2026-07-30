"use client";

import Link from "next/link";
import { Compass, MapPlus, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RemixTripButton } from "@/components/trips/remix-trip-button";

type Props = {
  isLoggedIn: boolean;
  hasDraft: boolean;
  onSaveDraft?: () => void;
  saving?: boolean;
};

export function PlannerEmptyState({
  isLoggedIn,
  hasDraft,
  onSaveDraft,
  saving,
}: Props) {
  return (
    <div className="mt-6 space-y-8">
      <div>
        <p className="eyebrow text-primary">What&apos;s next</p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
          {hasDraft
            ? "Your draft is ready — pick a next step."
            : "Start a trip, or remix a template."}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Remix the Western Canada template to get Places-enriched stops,
          overnight stays, checkboxes, and a live map — then tweak the schedule
          as you go.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
            <Route className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">Remix Western Canada</h3>
          <p className="mt-2 text-base text-muted-foreground">
            Copy the 13-day seeded itinerary with real Places data into your
            planner.
          </p>
          <div className="mt-5">
            <RemixTripButton slug="western-canada-2026" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
            <MapPlus className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">
            {isLoggedIn ? "Save this draft" : "Keep planning as a guest"}
          </h3>
          <p className="mt-2 text-base text-muted-foreground">
            {isLoggedIn
              ? "Save to your account so it syncs across devices and can be shared later."
              : "No account needed to sketch a route. Sign in when you want to save or share."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {isLoggedIn && hasDraft && onSaveDraft ? (
              <Button
                type="button"
                size="lg"
                className="text-base"
                onClick={onSaveDraft}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save to my account"}
              </Button>
            ) : null}
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link href="/trips/western-canada-2026">Preview template</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6 text-base">
        <Compass className="h-4 w-4 text-primary" />
        <Link
          href="/discover"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Browse public trips
        </Link>
        {isLoggedIn ? (
          <>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/planner"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Open my trips
            </Link>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">·</span>
            <Link
              href="/auth/login?next=/planner"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
