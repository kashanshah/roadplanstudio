"use client";

import { useEffect, useId, useState } from "react";
import { BedDouble, Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceDetailsPayload } from "@/components/planner/planner-types";
import { cn } from "@/lib/utils/cn";

type Props = {
  dayId: string;
  disabled?: boolean;
  bias?: { lat: number; lng: number } | null;
  onAdd: (place: PlaceDetailsPayload, asHotel: boolean) => Promise<void> | void;
};

export function AddStopSearch({ dayId, disabled, bias, onAdd }: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceDetailsPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ q: query.trim() });
      if (bias) {
        params.set("lat", String(bias.lat));
        params.set("lng", String(bias.lng));
      }
      fetch(`/api/places/search?${params}`, { signal: controller.signal })
        .then(async (res) => {
          const data = (await res.json()) as {
            places?: PlaceDetailsPayload[];
            error?: string;
          };
          if (!res.ok) throw new Error(data.error || "Search failed");
          setResults(data.places ?? []);
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          setResults([]);
          setError(err instanceof Error ? err.message : "Search failed");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, open, bias, dayId]);

  async function addPlace(place: PlaceDetailsPayload, asHotel: boolean) {
    setAddingId(place.placeId);
    try {
      await onAdd(place, asHotel);
      setQuery("");
      setResults([]);
      setOpen(false);
    } finally {
      setAddingId(null);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-3 text-base"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4" />
        Add stop
      </Button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl border border-border bg-background/80 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Google Places…"
          aria-controls={listId}
          className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {loading ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Searching Places…
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <ul id={listId} className="mt-2 max-h-56 space-y-1 overflow-y-auto">
        {results.map((place) => (
          <li
            key={place.placeId}
            className="rounded-xl border border-transparent p-2 hover:border-border hover:bg-secondary/60"
          >
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{place.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {place.formattedAddress}
                {place.rating != null ? ` · ★ ${place.rating.toFixed(1)}` : ""}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!!addingId}
                onClick={() => void addPlace(place, false)}
                className={cn(
                  "rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground min-h-10",
                  addingId === place.placeId && "opacity-70",
                )}
              >
                Add stop
              </button>
              <button
                type="button"
                disabled={!!addingId}
                onClick={() => void addPlace(place, true)}
                className="inline-flex min-h-10 items-center gap-1 rounded-full bg-secondary px-3 py-2 text-sm text-secondary-foreground"
              >
                <BedDouble className="size-3.5" />
                As hotel
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 text-sm text-muted-foreground underline-offset-2 hover:underline"
        onClick={() => {
          setOpen(false);
          setQuery("");
          setResults([]);
        }}
      >
        Cancel
      </button>
    </div>
  );
}
