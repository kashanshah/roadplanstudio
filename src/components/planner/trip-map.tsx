"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";

export type MapStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string;
  dayIndex?: number;
  status?: string;
};

type Props = {
  stops: MapStop[];
  className?: string;
  focusStopId?: string | null;
};

const DEFAULT_CENTER = { lat: 52.5, lng: -119.5 };

function FitBounds({ stops }: { stops: MapStop[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || stops.length === 0) return;

    if (stops.length === 1) {
      map.setCenter({ lat: stops[0].latitude, lng: stops[0].longitude });
      map.setZoom(10);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const stop of stops) {
      bounds.extend({ lat: stop.latitude, lng: stop.longitude });
    }
    map.fitBounds(bounds, 64);
  }, [map, stops]);

  return null;
}

function RoutePolyline({ stops }: { stops: MapStop[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || stops.length < 2) return;

    const path = stops.map((s) => ({
      lat: s.latitude,
      lng: s.longitude,
    }));

    const line = new google.maps.Polyline({
      path,
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
}: {
  stops: MapStop[];
  selected: MapStop | null;
  onSelect: (stop: MapStop) => void;
}) {
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
      defaultZoom={5}
      gestureHandling="greedy"
      disableDefaultUI={false}
      className="h-full w-full"
      mapTypeControl={false}
      streetViewControl={false}
      fullscreenControl
    >
      <FitBounds stops={stops} />
      <RoutePolyline stops={stops} />
      <FocusStop stop={selected} />
      {stops.map((stop) => (
        <Marker
          key={stop.id}
          position={{ lat: stop.latitude, lng: stop.longitude }}
          title={stop.name}
          onClick={() => onSelect(stop)}
        />
      ))}
    </Map>
  );
}

export function TripMap({ stops, className, focusStopId }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selected, setSelected] = useState<MapStop | null>(null);

  useEffect(() => {
    if (!focusStopId) return;
    const match = stops.find((s) => s.id === focusStopId) ?? null;
    if (match) setSelected(match);
  }, [focusStopId, stops]);

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
          No mapped stops yet. Remix a template or add places with coordinates.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border ${className ?? ""}`}>
      <APIProvider apiKey={apiKey}>
        <div className="h-full min-h-[420px] w-full sm:min-h-[520px]">
          <MapCanvas
            stops={stops}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </APIProvider>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-16">
        <p className="text-sm text-snow/90 sm:text-base">
          {selected ? selected.name : `${stops.length} stops on the route`}
        </p>
        <div className="pointer-events-auto mt-2 flex max-w-full gap-2 overflow-x-auto pb-1">
          {stops.slice(0, 12).map((stop) => (
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
              {stop.name}
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
