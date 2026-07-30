"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  ChevronLeft,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { AddStopSearch } from "@/components/planner/add-stop-search";
import {
  formatDurationLabel,
} from "@/components/planner/use-day-timeline";
import {
  statusLabel,
  type PlaceDetailsPayload,
  type PlannerItem,
  type StopStatus,
} from "@/components/planner/planner-types";
import {
  buildStopTimePatch,
  dayOffsetFromMins,
  minsToTimeInput,
  resolveDepartAfterArrive,
  timeInputToMins,
} from "@/lib/trips/stop-time";
import { cn } from "@/lib/utils/cn";

type ReplacePlacePayload = {
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  googleMapsUri: string | null;
  type: "attraction" | "hotel" | "custom";
};

type Props = {
  item: PlannerItem | null;
  isEditor: boolean;
  /** Computed timeline arrive (minutes from midnight). */
  arriveMins?: number | null;
  /** Computed timeline depart (minutes from midnight). */
  departMins?: number | null;
  /** First stop in the day — arrive edits set the day start. */
  isFirstStop?: boolean;
  dayId?: string;
  searchBias?: { lat: number; lng: number } | null;
  onClose: () => void;
  onUpdate: (
    itemId: string,
    patch: Partial<
      Pick<
        PlannerItem,
        | "status"
        | "durationMins"
        | "notes"
        | "travelMode"
        | "timingMode"
        | "timingMins"
        | "customTravelDurationMins"
        | "customTravelDistanceKm"
      >
    >,
  ) => Promise<void> | void;
  onReplace?: (
    itemId: string,
    next: ReplacePlacePayload,
  ) => Promise<void> | void;
  onDelete?: (itemId: string) => Promise<void> | void;
};

const STATUSES: StopStatus[] = [
  "to_visit",
  "visited",
  "favorite",
  "skipped",
];

export function PlaceDetailSheet({
  item,
  isEditor,
  arriveMins = null,
  departMins = null,
  isFirstStop = false,
  dayId,
  searchBias = null,
  onClose,
  onUpdate,
  onReplace,
  onDelete,
}: Props) {
  const [details, setDetails] = useState<PlaceDetailsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [arriveDraft, setArriveDraft] = useState("");
  const [departDraft, setDepartDraft] = useState("");
  const [timeError, setTimeError] = useState<string | null>(null);
  const [customTravelDuration, setCustomTravelDuration] = useState("");
  const [customTravelDistance, setCustomTravelDistance] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changingPlace, setChangingPlace] = useState(false);

  useEffect(() => {
    if (!item) {
      setDetails(null);
      setError(null);
      return;
    }
    setNotes(item.notes ?? "");
    const arrive =
      arriveMins ??
      item.timingMins ??
      8 * 60;
    const depart =
      departMins ??
      arrive + (item.durationMins ?? 60);
    setArriveDraft(minsToTimeInput(arrive));
    setDepartDraft(minsToTimeInput(depart));
    setTimeError(null);
    setCustomTravelDuration(
      item.customTravelDurationMins != null
        ? String(item.customTravelDurationMins)
        : "",
    );
    setCustomTravelDistance(
      item.customTravelDistanceKm != null ? String(item.customTravelDistanceKm) : "",
    );
    setConfirmDelete(false);
    setChangingPlace(false);

    if (!item.googlePlaceId) {
      setDetails(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetails(null);

    fetch(`/api/places/${encodeURIComponent(item.googlePlaceId)}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          place?: PlaceDetailsPayload;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Could not load place");
        return data.place ?? null;
      })
      .then((place) => {
        if (!cancelled) setDetails(place);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load place",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [item, arriveMins, departMins]);

  if (!item) return null;

  const photoName = details?.photoNames?.[0];
  const photoUrl = photoName
    ? `/api/places/photo?name=${encodeURIComponent(photoName)}&maxWidthPx=900`
    : null;

  const isHotel = item?.type === "hotel";
  const draftDepartWall = timeInputToMins(departDraft);
  const draftArriveContinuous = isFirstStop
    ? draftDepartWall
    : (arriveMins ?? timeInputToMins(arriveDraft));
  const draftDepartContinuous =
    draftArriveContinuous != null && draftDepartWall != null
      ? isFirstStop
        ? draftDepartWall
        : resolveDepartAfterArrive(draftArriveContinuous, draftDepartWall)
      : null;
  const draftStayMins =
    draftArriveContinuous != null && draftDepartContinuous != null
      ? Math.max(0, draftDepartContinuous - draftArriveContinuous)
      : null;
  const arriveDayOffset =
    arriveMins != null ? dayOffsetFromMins(arriveMins) : 0;

  async function saveMeta() {
    if (!item || !isEditor) return;
    setSaving(true);
    setTimeError(null);
    try {
      const customDuration =
        customTravelDuration.trim() === ""
          ? null
          : Number.parseInt(customTravelDuration, 10);
      const customDistance =
        customTravelDistance.trim() === ""
          ? null
          : Number.parseFloat(customTravelDistance);

      let timePatch: Partial<
        Pick<PlannerItem, "durationMins" | "timingMode" | "timingMins">
      > = {};

      if (!isHotel || isFirstStop) {
        const departWall = timeInputToMins(departDraft);
        if (departWall == null) {
          setTimeError(
            isFirstStop
              ? "Enter a valid depart time."
              : "Enter a valid depart time.",
          );
          return;
        }
        const arrive = isFirstStop
          ? departWall
          : (arriveMins ?? timeInputToMins(arriveDraft));
        if (arrive == null) {
          setTimeError("Enter a valid arrive and depart time.");
          return;
        }
        const depart = isFirstStop
          ? departWall
          : resolveDepartAfterArrive(arrive, departWall);
        timePatch = buildStopTimePatch({
          arriveMins: arrive,
          departMins: depart,
          isFirstStop,
        });
      }

      await onUpdate(item.id, {
        notes: notes.trim() || null,
        ...timePatch,
        customTravelDurationMins:
          customDuration != null && Number.isFinite(customDuration)
            ? customDuration
            : null,
        customTravelDistanceKm:
          customDistance != null && Number.isFinite(customDistance)
            ? customDistance
            : null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item || !isEditor || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(item.id);
      onClose();
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pt-[env(safe-area-inset-top)] sm:items-stretch sm:justify-end sm:p-0">
      <button
        type="button"
        aria-label="Close place details"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative z-10 flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)))] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevated",
          "sm:my-3 sm:mr-3 sm:max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top))] sm:w-[min(100%,420px)] sm:rounded-3xl",
        )}
      >
        <div className="relative h-44 shrink-0 bg-secondary sm:h-52">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[linear-gradient(140deg,var(--spruce),var(--glacier))] text-snow/80">
              {item.type === "hotel" ? (
                <BedDouble className="size-10" />
              ) : (
                <MapPin className="size-10" />
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute left-3 top-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-ink/55 px-3 text-sm font-medium text-snow backdrop-blur-sm sm:hidden"
            aria-label="Back to planner"
          >
            <ChevronLeft className="size-4" />
            Back
          </button>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink/55 text-snow backdrop-blur-sm"
            aria-label="Close"
            {...tip("Close")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            {item.type === "hotel" ? "Overnight" : "Stop"}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold leading-tight">
            {details?.name || item.name}
          </h2>

          {(details?.rating != null || item.address || details?.formattedAddress) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              {details?.rating != null ? (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Star className="size-3.5 fill-accent text-accent" />
                  {details.rating.toFixed(1)}
                  {details.userRatingCount != null
                    ? ` · ${details.userRatingCount.toLocaleString()} reviews`
                    : null}
                </span>
              ) : null}
              <span className="inline-flex items-start gap-1">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {details?.formattedAddress || item.address || "Address TBD"}
              </span>
            </div>
          )}

          {loading ? (
            <p className="mt-4 text-base text-muted-foreground">
              Loading Places details…
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Live Places details unavailable — showing saved stop data.
            </p>
          ) : null}

          {details?.editorialSummary ? (
            <p className="mt-4 text-base leading-relaxed text-foreground/90">
              {details.editorialSummary}
            </p>
          ) : item.notes ? (
            <p className="mt-4 text-base leading-relaxed text-foreground/90">
              {item.notes}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={!isEditor}
                onClick={() => void onUpdate(item.id, { status })}
                className={cn(
                  "min-h-10 rounded-full px-4 py-2 text-sm transition-colors",
                  item.status === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
                  !isEditor && "opacity-70",
                )}
              >
                {statusLabel(status)}
              </button>
            ))}
          </div>

          {isEditor && onReplace && dayId ? (
            <div className="mt-6 space-y-2 rounded-xl border border-border bg-background/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Change place
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant={changingPlace ? "secondary" : "outline"}
                  onClick={() => setChangingPlace((prev) => !prev)}
                >
                  {changingPlace ? "Cancel" : "Replace"}
                </Button>
              </div>
              {changingPlace ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Times and notes stay the same.
                  </p>
                  <AddStopSearch
                    dayId={dayId}
                    variant="replace"
                    bias={
                      searchBias ??
                      (item.latitude != null && item.longitude != null
                        ? { lat: item.latitude, lng: item.longitude }
                        : null)
                    }
                    defaultAsHotel={item.type === "hotel"}
                    onReplace={async (place, asHotel) => {
                      await onReplace(item.id, {
                        name: place.name,
                        address: place.formattedAddress,
                        latitude: place.latitude,
                        longitude: place.longitude,
                        googlePlaceId: place.placeId,
                        googleMapsUri: place.googleMapsUri,
                        type: asHotel ? "hotel" : "attraction",
                      });
                      setChangingPlace(false);
                    }}
                    onReplaceCustom={async (input) => {
                      await onReplace(item.id, {
                        name: input.name,
                        address: input.address ?? null,
                        latitude: null,
                        longitude: null,
                        googlePlaceId: null,
                        googleMapsUri: null,
                        type: input.asHotel ? "hotel" : "custom",
                      });
                      setChangingPlace(false);
                    }}
                  />
                </>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
                Notes
              </span>
              <textarea
                value={notes}
                disabled={!isEditor}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-base outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                placeholder="Tickets, parking, meeting spots…"
              />
            </label>

            {isHotel && !isFirstStop ? (
              <div className="rounded-xl border border-border bg-sandstone/15 p-3 text-sm text-foreground/85">
                Overnight stay — no depart time on this stop.
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-background/80 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Clock className="size-3.5 text-primary" />
                  Schedule
                </p>
                <div
                  className={
                    isFirstStop
                      ? "mt-2 grid gap-2"
                      : "mt-2 grid gap-2 sm:grid-cols-2"
                  }
                >
                  {!isFirstStop ? (
                    <label className="block">
                      <span className="mb-1 block text-xs text-muted-foreground">
                        Arrive
                        <span>
                          {" "}
                          · from previous stop
                          {arriveDayOffset > 0 ? " · next day" : ""}
                        </span>
                      </span>
                      <input
                        type="time"
                        value={arriveDraft}
                        disabled
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                    </label>
                  ) : null}
                  <label className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">
                      Depart
                      {draftDepartContinuous != null &&
                      dayOffsetFromMins(draftDepartContinuous) > 0 ? (
                        <span> · next day</span>
                      ) : null}
                    </span>
                    <input
                      type="time"
                      value={departDraft}
                      disabled={!isEditor}
                      onChange={(e) => setDepartDraft(e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                  </label>
                </div>
                {!isFirstStop ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Stay{" "}
                    <span className="font-medium text-foreground">
                      {draftStayMins != null
                        ? formatDurationLabel(draftStayMins)
                        : "—"}
                    </span>{" "}
                    (auto)
                    {arriveDayOffset > 0
                      ? " · overnight arrival kept on next day"
                      : ""}
                  </p>
                ) : null}
                {timeError ? (
                  <p className="mt-1 text-sm text-destructive" role="alert">
                    {timeError}
                  </p>
                ) : null}
              </div>
            )}

            <div className="rounded-xl border border-border bg-background/80 p-3">
              <p className="text-sm font-medium text-foreground">
                Custom travel to next stop
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    Duration (mins)
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={customTravelDuration}
                    disabled={!isEditor}
                    onChange={(e) => setCustomTravelDuration(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-muted-foreground">
                    Distance (km)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={customTravelDistance}
                    disabled={!isEditor}
                    onChange={(e) => setCustomTravelDistance(e.target.value)}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                  />
                </label>
              </div>
            </div>
          </div>

          {details?.regularOpeningHours?.length ? (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground">Hours</p>
              <ul className="mt-2 space-y-1 text-sm text-foreground/85">
                {details.regularOpeningHours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {(details?.googleMapsUri || item.googleMapsUri) && (
              <Button asChild variant="secondary" size="sm">
                <a
                  href={details?.googleMapsUri || item.googleMapsUri || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-4" />
                  Maps
                </a>
              </Button>
            )}
            {details?.websiteUri ? (
              <Button asChild variant="secondary" size="sm">
                <a href={details.websiteUri} target="_blank" rel="noreferrer">
                  Website
                </a>
              </Button>
            ) : null}
            {details?.nationalPhoneNumber ? (
              <Button asChild variant="ghost" size="sm">
                <a href={`tel:${details.nationalPhoneNumber}`}>
                  <Phone className="size-4" />
                  {details.nationalPhoneNumber}
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {isEditor ? (
          <div className="shrink-0 space-y-3 border-t border-border p-4">
            <Button
              type="button"
              className="w-full text-base"
              onClick={() => void saveMeta()}
              disabled={saving || deleting}
            >
              {saving ? "Saving…" : "Save schedule & notes"}
            </Button>

            {onDelete ? (
              confirmDelete ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-sm text-foreground">
                    Remove{" "}
                    <span className="font-medium">
                      {details?.name || item.name}
                    </span>{" "}
                    from this day? This can&apos;t be undone.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      disabled={deleting}
                      onClick={() => void handleDelete()}
                    >
                      <Trash2 className="size-4" />
                      {deleting ? "Removing…" : "Remove stop"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      disabled={deleting}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={saving || deleting}
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                  Remove from itinerary
                </Button>
              )
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
