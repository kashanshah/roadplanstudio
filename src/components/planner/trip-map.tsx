"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";
import { statusLabel, type StopStatus } from "@/components/planner/planner-types";
import {
  formatDurationLabel,
} from "@/components/planner/use-day-timeline";
import {
  formatClockWithDayOffset,
  type TimeFormat,
} from "@/lib/prefs/display-prefs";

export type MapStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string;
  dayIndex?: number;
  status?: string;
  address?: string | null;
  notes?: string | null;
  googleMapsUri?: string | null;
  arriveMins?: number | null;
  departMins?: number | null;
  stayMins?: number | null;
  /** True when this is the first stop of its day (day-start, not a fresh arrival). */
  isDayStart?: boolean;
  /** Mode from this stop to the next (for daily directions). */
  travelMode?: "driving" | "walking" | "bicycling" | "transit";
};

function stopTypeLabel(type?: string) {
  if (type === "hotel") return "Hotel";
  if (type === "custom") return "Custom";
  return "Stop";
}

export type TripMapMode = "directions" | "straight";

type Props = {
  stops: MapStop[];
  className?: string;
  focusStopId?: string | null;
  mode?: TripMapMode;
  title?: string;
  emptyMessage?: string;
  timeFormat?: TimeFormat;
};

const DEFAULT_CENTER = { lat: 52.5, lng: -119.5 };

function FitBounds({
  stops,
  path,
}: {
  stops: MapStop[];
  path?: Array<{ lat: number; lng: number }>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const points =
      path && path.length
        ? path
        : stops.map((s) => ({ lat: s.latitude, lng: s.longitude }));
    if (!points.length) return;

    if (points.length === 1) {
      map.setCenter(points[0]);
      map.setZoom(10);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const point of points) bounds.extend(point);
    map.fitBounds(bounds, 64);
  }, [map, stops, path]);

  return null;
}

/** Straight-line geodesic path between stops (full-trip overview). */
function StraightPolyline({ stops }: { stops: MapStop[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || stops.length < 2) return;

    const line = new google.maps.Polyline({
      path: stops.map((s) => ({ lat: s.latitude, lng: s.longitude })),
      geodesic: true,
      strokeColor: "#1A6B63",
      strokeOpacity: 0.85,
      strokeWeight: 3,
      map,
    });

    return () => {
      line.setMap(null);
    };
  }, [map, stops]);

  return null;
}

/** Road-following path from server Directions (stable vs browser Directions key). */
function DirectionsPolyline({
  stops,
  onPath,
}: {
  stops: MapStop[];
  onPath: (path: Array<{ lat: number; lng: number }> | null) => void;
}) {
  const map = useMap();
  const fingerprint = stops
    .map((s) => `${s.id}:${s.latitude},${s.longitude}:${s.travelMode ?? "driving"}`)
    .join("|");

  useEffect(() => {
    if (!map || stops.length < 2) {
      onPath(null);
      return;
    }

    const controller = new AbortController();
    let line: google.maps.Polyline | null = null;
    let cancelled = false;
    const stopSnapshot = stops;
    const modes = stopSnapshot.slice(0, -1).map((s) => s.travelMode ?? "driving");

    fetch("/api/maps/route-legs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        points: stopSnapshot.map((s) => ({
          latitude: s.latitude,
          longitude: s.longitude,
        })),
        modes,
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          path?: Array<{ lat: number; lng: number }>;
          source?: "directions" | "estimated";
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Route failed");
        return data;
      })
      .then((data) => {
        if (cancelled || !map) return;
        const path =
          data.path && data.path.length >= 2
            ? data.path
            : stopSnapshot.map((s) => ({
                lat: s.latitude,
                lng: s.longitude,
              }));
        const isRoad = data.source === "directions";
        line = new google.maps.Polyline({
          path,
          geodesic: !isRoad,
          strokeColor: isRoad ? "#1A6B63" : "#C4A882",
          strokeOpacity: 0.95,
          strokeWeight: isRoad ? 5 : 4,
          map,
        });
        onPath(path);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || cancelled) return;
        console.error(err);
        const fallback = stopSnapshot.map((s) => ({
          lat: s.latitude,
          lng: s.longitude,
        }));
        line = new google.maps.Polyline({
          path: fallback,
          geodesic: true,
          strokeColor: "#C4A882",
          strokeOpacity: 0.9,
          strokeWeight: 4,
          map,
        });
        onPath(fallback);
      });

    return () => {
      cancelled = true;
      controller.abort();
      line?.setMap(null);
      onPath(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fingerprint drives refetch
  }, [map, fingerprint]);

  return null;
}

function FocusStop({ stop }: { stop: MapStop | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !stop) return;
    map.panTo({ lat: stop.latitude, lng: stop.longitude });
    const zoom = map.getZoom() ?? 5;
    if (zoom < 8) map.setZoom(8);
  }, [map, stop]);

  return null;
}

function MapCanvas({
  stops,
  selected,
  onSelect,
  mode,
  timeFormat,
}: {
  stops: MapStop[];
  selected: MapStop | null;
  onSelect: (stop: MapStop | null) => void;
  mode: TripMapMode;
  timeFormat: TimeFormat;
}) {
  const [routePath, setRoutePath] = useState<Array<{
    lat: number;
    lng: number;
  }> | null>(null);

  const center = useMemo(() => {
    if (!stops.length) return DEFAULT_CENTER;
    const lat =
      stops.reduce((sum, s) => sum + s.latitude, 0) / stops.length;
    const lng =
      stops.reduce((sum, s) => sum + s.longitude, 0) / stops.length;
    return { lat, lng };
  }, [stops]);

  return (
    <Map
      defaultCenter={center}
      defaultZoom={mode === "directions" ? 8 : 5}
      gestureHandling="greedy"
      disableDefaultUI={false}
      className="h-full w-full"
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl
      onClick={() => onSelect(null)}
    >
      <FitBounds
        stops={stops}
        path={mode === "directions" ? routePath ?? undefined : undefined}
      />
      {mode === "directions" ? (
        <DirectionsPolyline stops={stops} onPath={setRoutePath} />
      ) : (
        <StraightPolyline stops={stops} />
      )}
      <FocusStop stop={selected} />
      {stops.map((stop, index) => (
        <Marker
          key={stop.id}
          position={{ lat: stop.latitude, lng: stop.longitude }}
          title={`${index + 1}. ${stop.name}`}
          label={{
            text: String(index + 1),
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "12px",
            className: "map-pin-label",
          }}
          zIndex={selected?.id === stop.id ? 1000 : index + 1}
          onClick={(e) => {
            e.stop();
            onSelect(stop);
          }}
        />
      ))}
      {selected ? (
        <InfoWindow
          position={{ lat: selected.latitude, lng: selected.longitude }}
          maxWidth={300}
          pixelOffset={[0, -36]}
          onCloseClick={() => onSelect(null)}
          headerContent={
            <span className="font-display text-base font-semibold text-foreground">
              {stops.findIndex((s) => s.id === selected.id) + 1}. {selected.name}
            </span>
          }
        >
          <div className="max-w-[260px] space-y-2.5 pb-1 pt-0.5 text-sm text-foreground">
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {stopTypeLabel(selected.type)}
              </span>
              {selected.dayIndex != null ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  Day {selected.dayIndex}
                </span>
              ) : null}
              {selected.status ? (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {statusLabel(selected.status as StopStatus)}
                </span>
              ) : null}
            </div>

            {selected.arriveMins != null || selected.departMins != null ? (
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl bg-secondary/70 px-2.5 py-2 text-xs">
                {!selected.isDayStart &&
                selected.type !== "hotel" &&
                selected.arriveMins != null ? (
                  <>
                    <span className="text-muted-foreground">Arrive</span>
                    <span className="font-mono font-semibold tabular-nums text-primary">
                      {formatClockWithDayOffset(
                        selected.arriveMins,
                        timeFormat,
                      )}
                    </span>
                  </>
                ) : null}
                {(selected.isDayStart || selected.type !== "hotel") &&
                selected.departMins != null ? (
                  <>
                    <span className="text-muted-foreground">Depart</span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatClockWithDayOffset(
                        selected.departMins,
                        timeFormat,
                      )}
                    </span>
                  </>
                ) : null}
                {!selected.isDayStart &&
                selected.type !== "hotel" &&
                selected.stayMins != null &&
                selected.stayMins > 0 ? (
                  <>
                    <span className="text-muted-foreground">Stay</span>
                    <span className="font-medium">
                      {formatDurationLabel(selected.stayMins)}
                    </span>
                  </>
                ) : selected.type === "hotel" && !selected.isDayStart ? (
                  <>
                    <span className="text-muted-foreground">Stay</span>
                    <span className="font-medium">Overnight</span>
                  </>
                ) : null}
              </div>
            ) : null}

            {selected.address ? (
              <p className="leading-snug text-muted-foreground">
                {selected.address}
              </p>
            ) : null}
            {selected.notes ? (
              <p className="line-clamp-3 leading-snug text-foreground/80">
                {selected.notes}
              </p>
            ) : null}
            {selected.googleMapsUri ? (
              <a
                href={selected.googleMapsUri}
                target="_blank"
                rel="noreferrer"
                className="inline-flex font-medium text-primary underline-offset-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Open in Google Maps
              </a>
            ) : null}
          </div>
        </InfoWindow>
      ) : null}
    </Map>
  );
}

export function TripMap({
  stops,
  className,
  focusStopId,
  mode = "straight",
  title,
  emptyMessage,
  timeFormat = "h12",
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selected, setSelected] = useState<MapStop | null>(null);

  useEffect(() => {
    if (!focusStopId) return;
    const match = stops.find((s) => s.id === focusStopId) ?? null;
    if (match) setSelected(match);
  }, [focusStopId, stops]);

  // Keep the open popup in sync when schedule times refresh.
  useEffect(() => {
    if (!selected) return;
    const fresh = stops.find((s) => s.id === selected.id) ?? null;
    setSelected(fresh);
  }, [stops, selected?.id]);

  if (!apiKey) {
    return (
      <div
        className={`grid place-items-center rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center ${className ?? ""}`}
      >
        <p className="max-w-sm text-base text-muted-foreground">
          Add <code className="text-foreground">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          to see the live map. {stops.length} stops are ready to plot.
        </p>
      </div>
    );
  }

  if (!stops.length) {
    return (
      <div
        className={`grid place-items-center rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center ${className ?? ""}`}
      >
        <p className="max-w-sm text-base text-muted-foreground">
          {emptyMessage ??
            "No mapped stops yet. Remix a template or add places with coordinates."}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border ${className ?? ""}`}>
      <APIProvider apiKey={apiKey}>
        <div className="h-full min-h-[360px] w-full sm:min-h-[420px]">
          <MapCanvas
            key={`${mode}-${stops.map((s) => s.id).join(",")}`}
            stops={stops}
            selected={selected}
            onSelect={setSelected}
            mode={mode}
            timeFormat={timeFormat}
          />
        </div>
      </APIProvider>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-16">
        <p className="text-sm text-snow/90 sm:text-base">
          {selected
            ? selected.name
            : title ??
              (mode === "directions"
                ? `${stops.length} stops · road directions`
                : `${stops.length} stops · straight overview`)}
        </p>
        <div className="pointer-events-auto mt-2 flex max-w-full gap-2 overflow-x-auto pb-1">
          {stops.slice(0, 12).map((stop, index) => (
            <button
              key={stop.id}
              type="button"
              onClick={() => setSelected(stop)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm ${
                selected?.id === stop.id
                  ? "bg-snow text-ink"
                  : "bg-snow/15 text-snow hover:bg-snow/25"
              }`}
            >
              {index + 1}. {stop.name}
            </button>
          ))}
          {stops.length > 12 ? (
            <span className="shrink-0 self-center text-sm text-snow/70">
              +{stops.length - 12} more
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
