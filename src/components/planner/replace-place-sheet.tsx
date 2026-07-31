"use client";

import { useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { AddStopSearch } from "@/components/planner/add-stop-search";
import type { PlaceDetailsPayload } from "@/components/planner/planner-types";
import { tip } from "@/components/ui/app-tooltip";
import { cn } from "@/lib/utils/cn";

export type ReplacePlacePayload = {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  googleMapsUri: string | null;
  type: "attraction" | "hotel" | "custom";
};

type Props = {
  open: boolean;
  onClose: () => void;
  dayId: string;
  currentName: string;
  defaultAsHotel?: boolean;
  bias?: { lat: number; lng: number } | null;
  onReplace: (next: ReplacePlacePayload) => Promise<void> | void;
};

/**
 * Dedicated sheet for swapping a stop's place.
 * Choosing a result applies immediately — no separate Save/Done.
 */
export function ReplacePlaceSheet({
  open,
  onClose,
  dayId,
  currentName,
  defaultAsHotel = false,
  bias = null,
  onReplace,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center pt-[env(safe-area-inset-top)] sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close change place"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="replace-place-title"
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)))] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevated",
          "sm:max-h-[min(85dvh,720px)] sm:max-w-lg sm:rounded-3xl",
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-primary">
              <MapPin className="size-3.5" />
              Change place
            </p>
            <h2
              id="replace-place-title"
              className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl"
            >
              Replace stop
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Currently{" "}
              <span className="font-medium text-foreground">{currentName}</span>.
              Pick a new place — it applies right away. Times and notes stay.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
            {...tip("Close")}
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
          <AddStopSearch
            dayId={dayId}
            variant="replace"
            bias={bias}
            defaultAsHotel={defaultAsHotel}
            onReplace={async (place: PlaceDetailsPayload, asHotel) => {
              await onReplace({
                name: place.name,
                address: place.formattedAddress,
                latitude: place.latitude,
                longitude: place.longitude,
                googlePlaceId: place.placeId,
                googleMapsUri: place.googleMapsUri,
                type: asHotel ? "hotel" : "attraction",
              });
              onClose();
            }}
            onReplaceCustom={async (input) => {
              await onReplace({
                name: input.name,
                address: input.address ?? null,
                latitude: null,
                longitude: null,
                googlePlaceId: null,
                googleMapsUri: null,
                type: input.asHotel ? "hotel" : "custom",
              });
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
