"use client";

import Link from "next/link";
import { Compass, Route } from "lucide-react";
import { RemixTripButton } from "@/components/trips/remix-trip-button";

const TEMPLATES = [
  {
    slug: "western-canada-2026",
    title: "Western Canada 2026",
    blurb: "13-day loop · Saskatoon → Rockies → Vancouver → home",
    days: 13,
  },
] as const;

type Props = {
  compact?: boolean;
};

export function TemplateStrip({ compact }: Props) {
  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-border bg-card/80 p-4"
          : "rounded-2xl border border-border bg-card p-5"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Start from a base trip
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
            Remix a ready itinerary
          </h3>
        </div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <Compass className="size-3.5" />
          Discover
        </Link>
      </div>

      <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {TEMPLATES.map((trip) => (
          <li
            key={trip.slug}
            className="min-w-[min(260px,100%)] w-full flex-1 rounded-2xl border border-border bg-background p-4 sm:min-w-[260px]"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Route className="size-5" />
            </span>
            <p className="mt-3 text-lg font-semibold">{trip.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{trip.blurb}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {trip.days} days · Places-enriched
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <RemixTripButton slug={trip.slug} />
              <Link
                href={`/trips/${trip.slug}`}
                className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Preview
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
