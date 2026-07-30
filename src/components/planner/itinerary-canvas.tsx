"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BedDouble,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import { AddStopSearch } from "@/components/planner/add-stop-search";
import { PlaceDetailSheet } from "@/components/planner/place-detail-sheet";
import { TemplateStrip } from "@/components/planner/template-strip";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatDuration,
  nextCheckboxStatus,
  statusLabel,
  type PlaceDetailsPayload,
  type PlannerAccommodation,
  type PlannerDay,
  type PlannerItem,
  type StopStatus,
} from "@/components/planner/planner-types";
import { cn } from "@/lib/utils/cn";

type Props = {
  days: PlannerDay[];
  accommodations?: PlannerAccommodation[];
  isEditor: boolean;
  showTemplates?: boolean;
  onUpdateItem: (
    itemId: string,
    patch: Partial<Pick<PlannerItem, "status" | "durationMins" | "notes">>,
  ) => Promise<void> | void;
  onAddPlace?: (
    dayId: string,
    place: PlaceDetailsPayload,
    asHotel: boolean,
  ) => Promise<void> | void;
  onFocusStop?: (item: PlannerItem) => void;
};

function dayScheduleMins(items: PlannerItem[]) {
  return items.reduce((sum, item) => {
    if (item.type === "hotel") return sum;
    if (item.status === "skipped" || item.status === "cancelled") return sum;
    return sum + (item.durationMins ?? 60);
  }, 0);
}

function lodgingForDay(
  day: PlannerDay,
  accommodations: PlannerAccommodation[],
) {
  const byDay = accommodations.filter((a) => a.dayId === day.id);
  if (byDay.length) return byDay;
  return day.items
    .filter((i) => i.type === "hotel")
    .map((i) => ({
      id: `item-${i.id}`,
      dayId: day.id,
      name: i.name,
      address: i.address,
      checkInDate: day.date,
      checkOutDate: null,
      isConfirmed: "false",
      latitude: i.latitude,
      longitude: i.longitude,
      googlePlaceId: i.googlePlaceId,
      googleMapsUri: i.googleMapsUri,
    }));
}

export function ItineraryCanvas({
  days,
  accommodations = [],
  isEditor,
  showTemplates,
  onUpdateItem,
  onAddPlace,
  onFocusStop,
}: Props) {
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!days.length) return;
    setOpenDays((prev) => {
      if (Object.keys(prev).length) return prev;
      return Object.fromEntries(days.slice(0, 2).map((d) => [d.id, true]));
    });
  }, [days]);
  const [selected, setSelected] = useState<PlannerItem | null>(null);

  const progress = useMemo(() => {
    const all = days.flatMap((d) => d.items);
    const total = all.length;
    const visited = all.filter((i) => i.status === "visited").length;
    return { total, visited };
  }, [days]);

  function toggleDay(id: string) {
    setOpenDays((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function toggleVisited(item: PlannerItem) {
    if (!isEditor) return;
    await onUpdateItem(item.id, {
      status: nextCheckboxStatus(item.status),
    });
  }

  function biasForDay(day: PlannerDay) {
    const withCoords = day.items.find(
      (i) => i.latitude != null && i.longitude != null,
    );
    if (!withCoords || withCoords.latitude == null || withCoords.longitude == null)
      return null;
    return { lat: withCoords.latitude, lng: withCoords.longitude };
  }

  return (
    <div className="space-y-5">
      {showTemplates ? <TemplateStrip compact /> : null}

      {progress.total > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary/70 px-4 py-3">
          <p className="text-base text-foreground">
            <span className="font-semibold">{progress.visited}</span>
            <span className="text-muted-foreground">
              {" "}
              of {progress.total} stops checked
            </span>
          </p>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.round((progress.visited / progress.total) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}

      <ul className="space-y-4">
        {days.map((day) => {
          const open = openDays[day.id] ?? false;
          const schedule = dayScheduleMins(day.items);
          const lodging = lodgingForDay(day, accommodations);

          return (
            <li
              key={day.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <button
                type="button"
                onClick={() => toggleDay(day.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">
                    Day {day.dayIndex}
                    {day.date ? ` · ${day.date}` : ""}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
                    {day.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    {[
                      day.routeSummary,
                      day.items.length
                        ? `${day.items.length} stops`
                        : "No stops",
                      schedule ? `~${formatDuration(schedule)} on foot` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-300",
                    open && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-3 pb-4 pt-2 sm:px-4">
                      {day.items.length === 0 ? (
                        <p className="px-1 py-3 text-base text-muted-foreground">
                          Empty day — add a stop from Places search.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {day.items.map((item) => {
                            const checked = item.status === "visited";
                            const isHotel = item.type === "hotel";
                            return (
                              <li key={item.id}>
                                <div
                                  className={cn(
                                    "group flex items-start gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-secondary/50 sm:px-3",
                                    checked && "opacity-70",
                                  )}
                                >
                                  <Checkbox
                                    checked={checked}
                                    disabled={!isEditor}
                                    onCheckedChange={() =>
                                      void toggleVisited(item)
                                    }
                                    aria-label={`Mark ${item.name} visited`}
                                    className="mt-1"
                                  />
                                  <button
                                    type="button"
                                    className="min-w-0 flex-1 text-left"
                                    onClick={() => {
                                      setSelected(item);
                                      onFocusStop?.(item);
                                    }}
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={cn(
                                          "text-base font-semibold sm:text-lg",
                                          checked && "line-through",
                                        )}
                                      >
                                        {item.name}
                                      </span>
                                      {isHotel ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-sandstone/25 px-2 py-0.5 text-xs font-medium text-ink">
                                          <BedDouble className="size-3" />
                                          Hotel
                                        </span>
                                      ) : null}
                                      {item.status === "favorite" ? (
                                        <Heart className="size-3.5 fill-destructive text-destructive" />
                                      ) : null}
                                      {item.status !== "to_visit" &&
                                      item.status !== "visited" ? (
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                                          {statusLabel(item.status as StopStatus)}
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                      {item.address ? (
                                        <span className="inline-flex items-center gap-1">
                                          <MapPin className="size-3.5" />
                                          <span className="line-clamp-1">
                                            {item.address}
                                          </span>
                                        </span>
                                      ) : null}
                                      {formatDuration(item.durationMins) ? (
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="size-3.5" />
                                          {formatDuration(item.durationMins)}
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="size-3.5" />
                                          Set duration
                                        </span>
                                      )}
                                      {item.googlePlaceId ? (
                                        <span className="inline-flex items-center gap-1 text-primary">
                                          <Star className="size-3.5" />
                                          Places
                                        </span>
                                      ) : null}
                                    </div>
                                    {item.notes ? (
                                      <p className="mt-1 line-clamp-2 text-sm text-foreground/75">
                                        {item.notes}
                                      </p>
                                    ) : null}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {lodging.length ? (
                        <div className="mt-3 space-y-2 border-t border-dashed border-border pt-3">
                          {lodging.map((stay) => (
                            <div
                              key={stay.id}
                              className="flex items-start gap-3 rounded-2xl bg-sandstone/15 px-3 py-3"
                            >
                              <span className="mt-0.5 grid size-9 place-items-center rounded-xl bg-sandstone/30 text-ink">
                                <BedDouble className="size-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium">{stay.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {[
                                    stay.checkInDate
                                      ? `Check-in ${stay.checkInDate}`
                                      : "Overnight stay",
                                    stay.checkOutDate
                                      ? `out ${stay.checkOutDate}`
                                      : null,
                                    stay.isConfirmed === "true"
                                      ? "Confirmed"
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                                {stay.address ? (
                                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                    {stay.address}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {isEditor && onAddPlace ? (
                        <AddStopSearch
                          dayId={day.id}
                          bias={biasForDay(day)}
                          onAdd={(place, asHotel) =>
                            onAddPlace(day.id, place, asHotel)
                          }
                        />
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <PlaceDetailSheet
        item={selected}
        isEditor={isEditor}
        onClose={() => setSelected(null)}
        onUpdate={async (itemId, patch) => {
          await onUpdateItem(itemId, patch);
          setSelected((prev) =>
            prev && prev.id === itemId ? { ...prev, ...patch } : prev,
          );
        }}
      />
    </div>
  );
}
