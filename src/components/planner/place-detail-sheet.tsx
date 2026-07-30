"use client";

import { useEffect, useState } from "react";
import {
  BedDouble,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDuration,
  statusLabel,
  type PlaceDetailsPayload,
  type PlannerItem,
  type StopStatus,
} from "@/components/planner/planner-types";
import { cn } from "@/lib/utils/cn";

type Props = {
  item: PlannerItem | null;
  isEditor: boolean;
  onClose: () => void;
  onUpdate: (
    itemId: string,
    patch: Partial<
      Pick<PlannerItem, "status" | "durationMins" | "notes" | "travelMode">
    >,
  ) => Promise<void> | void;
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
  onClose,
  onUpdate,
}: Props) {
  const [details, setDetails] = useState<PlaceDetailsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!item) {
      setDetails(null);
      setError(null);
      return;
    }
    setNotes(item.notes ?? "");
    setDuration(
      item.durationMins != null ? String(item.durationMins) : "",
    );

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
        if (!cancelled) {
          setDetails(place);
          if (place && !item.durationMins && place.estimatedDurationMins) {
            setDuration(String(place.estimatedDurationMins));
          }
        }
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
  }, [item]);

  if (!item) return null;

  const photoName = details?.photoNames?.[0];
  const photoUrl = photoName
    ? `/api/places/photo?name=${encodeURIComponent(photoName)}&maxWidthPx=900`
    : null;

  async function saveMeta() {
    if (!item || !isEditor) return;
    setSaving(true);
    try {
      const durationMins =
        duration.trim() === "" ? null : Number.parseInt(duration, 10);
      await onUpdate(item.id, {
        notes: notes.trim() || null,
        durationMins:
          durationMins != null && Number.isFinite(durationMins)
            ? durationMins
            : null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label="Close place details"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-elevated",
          "sm:my-3 sm:mr-3 sm:max-h-[calc(100vh-1.5rem)] sm:w-[min(100%,420px)] sm:rounded-3xl",
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
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ink/55 text-snow backdrop-blur-sm"
            aria-label="Close"
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
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
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

          <div className="mt-6 grid gap-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Clock className="size-3.5" />
                Planned duration (minutes)
              </span>
              <input
                type="number"
                min={0}
                max={1440}
                value={duration}
                disabled={!isEditor}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={
                  details?.estimatedDurationMins
                    ? `Suggested ${details.estimatedDurationMins}`
                    : "e.g. 90"
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
              {details?.estimatedDurationMins ? (
                <span className="mt-1 block text-sm text-muted-foreground">
                  Places type suggests ~
                  {formatDuration(details.estimatedDurationMins)}
                </span>
              ) : null}
            </label>

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
          <div className="shrink-0 border-t border-border p-4">
            <Button
              type="button"
              className="w-full text-base"
              onClick={() => void saveMeta()}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save schedule & notes"}
            </Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
