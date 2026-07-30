"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import type { PlaceDetailsPayload } from "@/components/planner/planner-types";
import { cn } from "@/lib/utils/cn";

export type PlaceSelection = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
};

type Props = {
  value: PlaceSelection | null;
  onChange: (place: PlaceSelection | null) => void;
  placeholder?: string;
  disabled?: boolean;
  bias?: { lat: number; lng: number } | null;
  tone?: "default" | "onDark";
  className?: string;
  inputClassName?: string;
  name?: string;
};

function toSelection(place: PlaceDetailsPayload): PlaceSelection {
  return {
    placeId: place.placeId,
    name: place.name,
    formattedAddress: place.formattedAddress,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export function PlaceAutocomplete({
  value,
  onChange,
  placeholder = "Search a place…",
  disabled,
  bias,
  tone = "default",
  className,
  inputClassName,
  name,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<PlaceDetailsPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value) setQuery(value.name);
    else if (!open) setQuery("");
  }, [value, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open || value || query.trim().length < 2) {
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
  }, [query, open, bias, value]);

  const onDark = tone === "onDark";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? (
        <input
          type="hidden"
          name={name}
          value={value?.name ?? ""}
          readOnly
        />
      ) : null}
      <div className="relative">
        <Search
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2",
            onDark ? "text-snow/45" : "text-muted-foreground",
          )}
        />
        <input
          value={query}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          onFocus={() => {
            if (!disabled) setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value) onChange(null);
            setOpen(true);
          }}
          className={cn(
            "h-12 w-full rounded-full border pl-10 pr-10 text-base outline-none focus-visible:ring-2 sm:text-lg",
            onDark
              ? "border-snow/20 bg-snow/10 text-snow placeholder:text-snow/45 focus-visible:ring-accent"
              : "border-input bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-ring",
            inputClassName,
          )}
        />
        {value || query ? (
          <button
            type="button"
            disabled={disabled}
            aria-label="Clear place"
            className={cn(
              "absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-colors",
              onDark
                ? "text-snow/60 hover:bg-snow/15 hover:text-snow"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
            onClick={() => {
              setQuery("");
              onChange(null);
              setResults([]);
              setOpen(false);
            }}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {open && !value && query.trim().length >= 2 ? (
        <div
          className={cn(
            "absolute inset-x-0 z-50 mt-2 overflow-hidden rounded-2xl border shadow-elevated",
            onDark
              ? "border-snow/20 bg-ink/95 text-snow backdrop-blur-md"
              : "border-border bg-popover text-popover-foreground",
          )}
        >
          {loading ? (
            <p
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm",
                onDark ? "text-snow/70" : "text-muted-foreground",
              )}
            >
              <Loader2 className="size-4 animate-spin" />
              Searching places…
            </p>
          ) : null}
          {error ? (
            <p className="px-4 py-3 text-sm text-destructive">{error}</p>
          ) : null}
          {!loading && !error && results.length === 0 ? (
            <p
              className={cn(
                "px-4 py-3 text-sm",
                onDark ? "text-snow/70" : "text-muted-foreground",
              )}
            >
              No places found
            </p>
          ) : null}
          <ul id={listId} role="listbox" className="max-h-64 overflow-y-auto py-1">
            {results.map((place) => (
              <li key={place.placeId}>
                <button
                  type="button"
                  role="option"
                  className={cn(
                    "flex w-full items-start gap-2 px-4 py-3 text-left transition-colors",
                    onDark ? "hover:bg-snow/10" : "hover:bg-secondary",
                  )}
                  onClick={() => {
                    onChange(toSelection(place));
                    setQuery(place.name);
                    setOpen(false);
                    setResults([]);
                  }}
                >
                  <MapPin
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      onDark ? "text-accent" : "text-primary",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-base font-medium">
                      {place.name}
                    </span>
                    {place.formattedAddress ? (
                      <span
                        className={cn(
                          "mt-0.5 block truncate text-sm",
                          onDark ? "text-snow/65" : "text-muted-foreground",
                        )}
                      >
                        {place.formattedAddress}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
