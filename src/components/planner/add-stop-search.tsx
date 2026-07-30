"use client";

import { useEffect, useId, useState } from "react";
import { BedDouble, Loader2, MapPin, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlaceDetailsPayload } from "@/components/planner/planner-types";
import { cn } from "@/lib/utils/cn";

export type StopTimingInput = {
  timingMode: "arrive_by" | "depart_at" | null;
  timingMins: number | null;
  /** Stay length derived from arrive → depart when both are set. */
  durationMins?: number | null;
};

export type CustomStopInput = {
  name: string;
  address?: string | null;
  notes?: string | null;
  asHotel?: boolean;
  timing?: StopTimingInput;
};

type Props = {
  dayId: string;
  disabled?: boolean;
  bias?: { lat: number; lng: number } | null;
  onAdd: (
    place: PlaceDetailsPayload,
    asHotel: boolean,
    timing: StopTimingInput,
  ) => Promise<void> | void;
  onAddCustom: (input: CustomStopInput) => Promise<void> | void;
};

type Mode = "search" | "custom";

export function AddStopSearch({
  dayId,
  disabled,
  bias,
  onAdd,
  onAddCustom,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceDetailsPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [customName, setCustomName] = useState("");
  const [customAddress, setCustomAddress] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [customAsHotel, setCustomAsHotel] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);
  const [arriveTime, setArriveTime] = useState("");
  const [departTime, setDepartTime] = useState("");

  function parseTimeToMins(value: string): number | null {
    if (!value) return null;
    const [h, m] = value.split(":");
    const hour = Number.parseInt(h ?? "", 10);
    const minute = Number.parseInt(m ?? "", 10);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return hour * 60 + minute;
  }

  const arriveMins = parseTimeToMins(arriveTime);
  const departMins = parseTimeToMins(departTime);
  const derivedStay =
    arriveMins != null && departMins != null
      ? Math.max(0, departMins - arriveMins)
      : null;

  const timingInput: StopTimingInput = (() => {
    if (arriveMins != null && departMins != null) {
      return {
        timingMode: "arrive_by",
        timingMins: arriveMins,
        durationMins: derivedStay,
      };
    }
    if (arriveMins != null) {
      return {
        timingMode: "arrive_by",
        timingMins: arriveMins,
        durationMins: null,
      };
    }
    if (departMins != null) {
      return {
        timingMode: "depart_at",
        timingMins: departMins,
        durationMins: null,
      };
    }
    return { timingMode: null, timingMins: null, durationMins: null };
  })();

  function resetAndClose() {
    setOpen(false);
    setMode("search");
    setQuery("");
    setResults([]);
    setError(null);
    setCustomName("");
    setCustomAddress("");
    setCustomNotes("");
    setCustomAsHotel(false);
    setArriveTime("");
    setDepartTime("");
  }

  const biasLat = bias?.lat;
  const biasLng = bias?.lng;

  useEffect(() => {
    if (!open || mode !== "search" || query.trim().length < 2) {
      if (mode === "search") {
        // Avoid setState([]) every run — a new [] always retriggers render.
        setResults((prev) => (prev.length === 0 ? prev : []));
        setError((prev) => (prev == null ? prev : null));
      }
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ q: query.trim() });
      if (biasLat != null && biasLng != null) {
        params.set("lat", String(biasLat));
        params.set("lng", String(biasLng));
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
  }, [query, open, biasLat, biasLng, dayId, mode]);

  async function addPlace(place: PlaceDetailsPayload, asHotel: boolean) {
    setAddingId(place.placeId);
    try {
      await onAdd(place, asHotel, timingInput);
      resetAndClose();
    } finally {
      setAddingId(null);
    }
  }

  async function submitCustom(e: React.FormEvent) {
    e.preventDefault();
    const name = customName.trim();
    if (!name || savingCustom) return;
    setSavingCustom(true);
    try {
      await onAddCustom({
        name,
        address: customAddress.trim() || null,
        notes: customNotes.trim() || null,
        asHotel: customAsHotel,
        timing: timingInput,
      });
      resetAndClose();
    } finally {
      setSavingCustom(false);
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
      <div className="flex gap-1 rounded-full border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setMode("search")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
            mode === "search"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Search className="size-3.5" />
          Search
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
            mode === "custom"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <MapPin className="size-3.5" />
          Custom
        </button>
      </div>

      {mode === "search" ? (
        <>
          <div className="relative mt-3">
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
                    {place.rating != null
                      ? ` · ★ ${place.rating.toFixed(1)}`
                      : ""}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!!addingId}
                    onClick={() => void addPlace(place, false)}
                    className={cn(
                      "min-h-10 rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground",
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
        </>
      ) : (
        <form onSubmit={(e) => void submitCustom(e)} className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Name
            </span>
            <input
              autoFocus
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Picnic pullout, friend’s cabin…"
              maxLength={200}
              className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Address{" "}
              <span className="font-normal">(optional)</span>
            </span>
            <input
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Where is it?"
              maxLength={500}
              className="h-11 w-full rounded-xl border border-input bg-card px-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
              Notes{" "}
              <span className="font-normal">(optional)</span>
            </span>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Parking, gate code, timing…"
              rows={2}
              maxLength={4000}
              className="w-full resize-none rounded-xl border border-input bg-card px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={customAsHotel}
              onChange={(e) => setCustomAsHotel(e.target.checked)}
              className="size-4 rounded border-input accent-[var(--primary)]"
            />
            <BedDouble className="size-3.5 text-muted-foreground" />
            Save as overnight lodging
          </label>
          <Button
            type="submit"
            size="sm"
            className="w-full text-base sm:w-auto"
            disabled={!customName.trim() || savingCustom}
          >
            {savingCustom ? "Adding…" : "Add custom stop"}
          </Button>
        </form>
      )}

      <div className="mt-3 rounded-xl border border-border bg-card/70 p-3">
        <p className="text-sm font-medium text-foreground">Times (optional)</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Stay is calculated from arrive → depart when both are set.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Arrive
            </span>
            <input
              type="time"
              value={arriveTime}
              onChange={(e) => setArriveTime(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
              Depart
            </span>
            <input
              type="time"
              value={departTime}
              onChange={(e) => setDepartTime(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>
        {derivedStay != null ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Stay{" "}
            <span className="font-medium text-foreground">
              {derivedStay < 60
                ? `${derivedStay} min`
                : `${Math.floor(derivedStay / 60)}h${
                    derivedStay % 60 ? ` ${derivedStay % 60}m` : ""
                  }`}
            </span>{" "}
            (auto)
          </p>
        ) : null}
      </div>

      <button
        type="button"
        className="mt-3 text-sm text-muted-foreground underline-offset-2 hover:underline"
        onClick={resetAndClose}
      >
        Cancel
      </button>
    </div>
  );
}
