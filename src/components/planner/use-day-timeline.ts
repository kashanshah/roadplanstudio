"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlannerItem } from "@/components/planner/planner-types";
import {
  normalizeTravelMode,
  type TravelMode,
} from "@/lib/maps/travel-mode";
import type { TimeFormat } from "@/lib/prefs/display-prefs";
import { formatClock } from "@/lib/prefs/display-prefs";

export type TravelLeg = {
  durationMins: number;
  distanceMeters: number;
  distanceKm: number;
  estimated: boolean;
  travelMode: TravelMode;
};

const DAY_START_MINS = 8 * 60; // 08:00
export const MAX_REALISTIC_DAY_MINS = 24 * 60;

function defaultStayMins(item: PlannerItem): number {
  if (item.type === "hotel") return 0;
  if (item.status === "skipped" || item.status === "cancelled") return 0;
  return item.durationMins ?? 60;
}

function isActiveStop(item: PlannerItem) {
  return item.status !== "skipped" && item.status !== "cancelled";
}

function hasCoords(item: PlannerItem) {
  return item.latitude != null && item.longitude != null;
}

export function formatDurationLabel(mins: number): string {
  if (mins <= 0) return "0 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export type TimelineRow = {
  item: PlannerItem;
  arriveMins: number;
  stayMins: number;
  departMins: number;
  legAfter: TravelLeg | null;
};

export function useDayTimeline(
  items: PlannerItem[],
  timeFormat: TimeFormat = "h12",
) {
  const routedStops = useMemo(
    () => items.filter((i) => isActiveStop(i) && hasCoords(i)),
    [items],
  );

  const modes = useMemo(
    () =>
      routedStops.slice(0, -1).map((i) => normalizeTravelMode(i.travelMode)),
    [routedStops],
  );

  const fingerprint = useMemo(
    () =>
      routedStops
        .map(
          (i, idx) =>
            `${i.id}:${i.latitude},${i.longitude}:${idx < modes.length ? modes[idx] : ""}`,
        )
        .join("|"),
    [routedStops, modes],
  );

  const [legs, setLegs] = useState<TravelLeg[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routedStops.length < 2) {
      setLegs([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch("/api/maps/route-legs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        points: routedStops.map((i) => ({
          latitude: i.latitude,
          longitude: i.longitude,
        })),
        modes,
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          legs?: TravelLeg[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Route failed");
        setLegs(
          (data.legs ?? []).map((leg, i) => ({
            ...leg,
            travelMode: normalizeTravelMode(leg.travelMode ?? modes[i]),
          })),
        );
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setLegs([]);
        console.error(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [fingerprint, routedStops, modes]);

  const timeline = useMemo(() => {
    const rows = buildTimelineRows(items, legs);
    const visitMins = rows.reduce((sum, r) => sum + r.stayMins, 0);
    const travelMins = rows.reduce(
      (sum, r) => sum + (r.legAfter?.durationMins ?? 0),
      0,
    );
    const totalMins = visitMins + travelMins;

    const startMins = rows[0]?.arriveMins ?? DAY_START_MINS;
    const endMins = rows[rows.length - 1]?.departMins ?? DAY_START_MINS;

    return {
      rows,
      visitMins,
      /** @deprecated use travelMins */
      driveMins: travelMins,
      travelMins,
      totalMins,
      overDay: totalMins > MAX_REALISTIC_DAY_MINS,
      endClock: formatClock(endMins, timeFormat),
      startClock: formatClock(startMins, timeFormat),
      daySpanHours: Math.round((totalMins / 60) * 10) / 10,
    };
  }, [items, legs, timeFormat]);

  return { ...timeline, loading };
}

/** Pure schedule builder — used by the map popup and the day timeline hook. */
export function buildTimelineRows(
  items: PlannerItem[],
  legs: TravelLeg[] = [],
): TimelineRow[] {
  const routedStops = items.filter((i) => isActiveStop(i) && hasCoords(i));
  const legByPair = new Map<string, TravelLeg>();
  for (let i = 0; i < legs.length; i++) {
    const from = routedStops[i];
    const to = routedStops[i + 1];
    if (from && to) {
      legByPair.set(`${from.id}->${to.id}`, legs[i]);
    }
  }

  let cursor = DAY_START_MINS;
  const rows: TimelineRow[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const stayMins = defaultStayMins(item);
    const arriveMins = cursor;
    const departMins = arriveMins + stayMins;

    let legAfter: TravelLeg | null = null;
    if (isActiveStop(item)) {
      for (let j = i + 1; j < items.length; j++) {
        const next = items[j]!;
        if (!isActiveStop(next)) continue;
        const routeLeg =
          hasCoords(item) && hasCoords(next)
            ? (legByPair.get(`${item.id}->${next.id}`) ?? null)
            : null;
        const customDuration = item.customTravelDurationMins;
        const customDistanceKm = item.customTravelDistanceKm;
        if (customDuration != null || customDistanceKm != null) {
          legAfter = {
            durationMins: customDuration ?? routeLeg?.durationMins ?? 0,
            distanceKm: customDistanceKm ?? routeLeg?.distanceKm ?? 0,
            distanceMeters: Math.round(
              (customDistanceKm ?? routeLeg?.distanceKm ?? 0) * 1000,
            ),
            estimated: true,
            travelMode: normalizeTravelMode(item.travelMode),
          };
        } else {
          legAfter = routeLeg;
        }
        break;
      }
    }

    rows.push({
      item,
      arriveMins,
      stayMins,
      departMins,
      legAfter,
    });

    cursor = departMins + (legAfter?.durationMins ?? 0);
  }

  const firstAnchored = rows.find(
    (row) =>
      row.item.timingMode &&
      row.item.timingMins != null &&
      row.item.timingMins >= 0 &&
      row.item.timingMins < 24 * 60,
  );
  if (firstAnchored) {
    const anchorCurrent =
      firstAnchored.item.timingMode === "depart_at"
        ? firstAnchored.departMins
        : firstAnchored.arriveMins;
    const delta = firstAnchored.item.timingMins! - anchorCurrent;
    if (delta !== 0) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]!;
        rows[i] = {
          ...row,
          arriveMins: row.arriveMins + delta,
          departMins: row.departMins + delta,
        };
      }
    }
  }

  return rows;
}
