"use client";

import { useEffect, useState } from "react";
import { MapPinned } from "lucide-react";
import {
  PlaceAutocomplete,
  type PlaceSelection,
} from "@/components/places/place-autocomplete";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type TripStartPlaceValue = {
  placeId: string | null;
  name: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  value: TripStartPlaceValue | null | undefined;
  isEditor: boolean;
  onSave: (place: TripStartPlaceValue | null) => Promise<void> | void;
  className?: string;
};

function toSelection(
  value: TripStartPlaceValue | null | undefined,
): PlaceSelection | null {
  if (!value?.placeId || !value.name) return null;
  if (value.latitude == null || value.longitude == null) return null;
  return {
    placeId: value.placeId,
    name: value.name,
    formattedAddress: value.address,
    latitude: value.latitude,
    longitude: value.longitude,
  };
}

export function TripStartPlacePanel({
  value,
  isEditor,
  onSave,
  className,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PlaceSelection | null>(toSelection(value));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(toSelection(value));
  }, [value, editing]);

  const label = value?.name?.trim() || "";

  async function commit() {
    const next: TripStartPlaceValue | null = draft
      ? {
          placeId: draft.placeId,
          name: draft.name,
          address: draft.formattedAddress,
          latitude: draft.latitude,
          longitude: draft.longitude,
        }
      : null;

    const same =
      (next?.placeId ?? null) === (value?.placeId ?? null) &&
      (next?.name ?? null) === (value?.name ?? null);
    if (same) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!isEditor && !label) return null;

  if (!editing) {
    return (
      <div
        className={cn(
          "mb-4 rounded-2xl border border-border bg-card/60 px-4 py-3 sm:px-5 sm:py-4",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <MapPinned className="size-3.5 shrink-0" />
            Trip start
          </p>
          {isEditor ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="shrink-0"
              onClick={() => setEditing(true)}
            >
              {label ? "Edit" : "Add"}
            </Button>
          ) : null}
        </div>
        {label ? (
          <div className="mt-2">
            <p className="text-base font-medium text-foreground">{label}</p>
            {value?.address ? (
              <p className="mt-1 text-sm text-muted-foreground">{value.address}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-base text-muted-foreground">
            Where does this road trip begin?
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 rounded-2xl border border-border bg-card px-4 py-3 sm:px-5 sm:py-4",
        className,
      )}
    >
      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <MapPinned className="size-3.5" />
        Trip start
      </p>
      <PlaceAutocomplete
        value={draft}
        onChange={setDraft}
        placeholder="Search Google Places…"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={saving}
          onClick={() => void commit()}
        >
          {saving ? "Saving…" : "Save start"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={saving}
          onClick={() => {
            setDraft(toSelection(value));
            setEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
