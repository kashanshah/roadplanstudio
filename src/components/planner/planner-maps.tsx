"use client";

import { useEffect, useMemo, useState } from "react";
import { TripMap, type MapStop } from "@/components/planner/trip-map";
import type { PlannerDay } from "@/components/planner/planner-types";
import { cn } from "@/lib/utils/cn";

type MapTab = "daily" | "trip";

type Props = {
  days: PlannerDay[];
  focusStopId?: string | null;
  activeDayId?: string | null;
  onActiveDayChange?: (dayId: string) => void;
  className?: string;
};

function stopsFromDay(day: PlannerDay): MapStop[] {
  return day.items
    .filter(
      (i) =>
        i.latitude != null &&
        i.longitude != null &&
        i.status !== "skipped" &&
        i.status !== "cancelled",
    )
    .map((i) => ({
      id: i.id,
      name: i.name,
      latitude: i.latitude as number,
      longitude: i.longitude as number,
      type: i.type,
      dayIndex: day.dayIndex,
      status: i.status,
      travelMode: i.travelMode ?? "driving",
    }));
}

function allTripStops(days: PlannerDay[]): MapStop[] {
  return days.flatMap((d) => stopsFromDay(d));
}

export function PlannerMaps({
  days,
  focusStopId,
  activeDayId,
  onActiveDayChange,
  className,
}: Props) {
  const [tab, setTab] = useState<MapTab>("daily");
  const mappedDays = useMemo(
    () => days.filter((d) => stopsFromDay(d).length > 0),
    [days],
  );

  const selectedDayId = useMemo(() => {
    if (activeDayId && mappedDays.some((d) => d.id === activeDayId)) {
      return activeDayId;
    }
    return mappedDays[0]?.id ?? null;
  }, [activeDayId, mappedDays]);

  const selectedDay =
    mappedDays.find((d) => d.id === selectedDayId) ?? mappedDays[0] ?? null;

  useEffect(() => {
    if (!focusStopId) return;
    const day = days.find((d) => d.items.some((i) => i.id === focusStopId));
    if (day) {
      onActiveDayChange?.(day.id);
      setTab("daily");
    }
  }, [focusStopId, days, onActiveDayChange]);

  const dailyStops = selectedDay ? stopsFromDay(selectedDay) : [];
  const tripStops = allTripStops(days);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex rounded-full border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setTab("daily")}
            className={cn(
              "min-h-10 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              tab === "daily"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Daily route
          </button>
          <button
            type="button"
            onClick={() => setTab("trip")}
            className={cn(
              "min-h-10 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              tab === "trip"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Full trip
          </button>
        </div>
        <p className="hidden text-sm text-muted-foreground md:block">
          {tab === "daily"
            ? "Route for the selected day (uses each leg’s travel mode)"
            : "Straight-line overview of the whole trip"}
        </p>
      </div>

      {tab === "daily" && mappedDays.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 px-1">
          {mappedDays.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onActiveDayChange?.(day.id)}
              className={cn(
                "min-h-10 shrink-0 rounded-full px-3.5 py-2 text-sm transition-colors",
                selectedDay?.id === day.id
                  ? "bg-secondary text-foreground ring-1 ring-primary/40"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
              )}
            >
              Day {day.dayIndex}
            </button>
          ))}
        </div>
      ) : null}

      {tab === "daily" ? (
        <TripMap
          key={`daily-${selectedDay?.id ?? "none"}`}
          mode="directions"
          stops={dailyStops}
          focusStopId={focusStopId}
          title={
            selectedDay
              ? `Day ${selectedDay.dayIndex} · road directions`
              : undefined
          }
          emptyMessage="Pick a day with mapped stops to see driving directions."
          className="h-[min(62vh,560px)]"
        />
      ) : (
        <TripMap
          key="trip-overview"
          mode="straight"
          stops={tripStops}
          focusStopId={focusStopId}
          title={`${tripStops.length} stops · straight-line overview`}
          emptyMessage="No mapped stops yet for the full-trip overview."
          className="h-[min(62vh,560px)]"
        />
      )}
    </div>
  );
}
