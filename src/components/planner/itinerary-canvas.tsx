"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Coffee,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AddStopSearch } from "@/components/planner/add-stop-search";
import type {
  CustomStopInput,
  StopTimingInput,
} from "@/components/planner/add-stop-search";
import { PlaceDetailSheet } from "@/components/planner/place-detail-sheet";
import { SortableDayStops } from "@/components/planner/sortable-day-stops";
import { TemplateStrip } from "@/components/planner/template-strip";
import { useDayTimeline } from "@/components/planner/use-day-timeline";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import {
  nextCheckboxStatus,
  type PlaceDetailsPayload,
  type PlannerDay,
  type PlannerItem,
} from "@/components/planner/planner-types";
import { useDisplayPrefs } from "@/lib/prefs/display-prefs";
import { formatDayHeading } from "@/lib/trips/format-day-label";
import { isTripStartItem } from "@/lib/trips/trip-start";
import { cn } from "@/lib/utils/cn";

type DayPatch = Partial<
  Pick<PlannerDay, "title" | "notes" | "date" | "routeSummary" | "isRestDay">
>;

type Props = {
  days: PlannerDay[];
  isEditor: boolean;
  showTemplates?: boolean;
  onUpdateItem: (
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
        | "type"
      >
    >,
  ) => Promise<void> | void;
  onDeleteItem?: (itemId: string) => Promise<void> | void;
  onReplaceItem?: (
    itemId: string,
    next: {
      name: string;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
      googlePlaceId: string | null;
      googleMapsUri: string | null;
      type: "attraction" | "hotel" | "custom";
    },
  ) => Promise<void> | void;
  /** Clears trip start (and Day 1 stop 1) when the pinned opener is removed. */
  onClearTripStart?: () => Promise<void> | void;
  onUpdateDay?: (dayId: string, patch: DayPatch) => Promise<void> | void;
  onDeleteDay?: (dayId: string) => Promise<void> | void;
  onReorderDay: (dayId: string, orderedItemIds: string[]) => Promise<void> | void;
  onCustomTravelChange?: (
    itemId: string,
    patch: Pick<
      PlannerItem,
      "customTravelDurationMins" | "customTravelDistanceKm"
    >,
  ) => Promise<void> | void;
  onAddPlace?: (
    dayId: string,
    place: PlaceDetailsPayload,
    asHotel: boolean,
    timing: StopTimingInput,
  ) => Promise<void> | void;
  onAddCustomPlace?: (
    dayId: string,
    input: CustomStopInput,
  ) => Promise<void> | void;
  onAddDay?: (opts?: { isRestDay?: boolean }) => Promise<void> | void;
  onFocusStop?: (item: PlannerItem) => void;
  /** Shared with map day selection — opening a day updates this, and vice versa. */
  activeDayId?: string | null;
  onSelectDay?: (dayId: string) => void;
};

function DayMenu({
  day,
  canDelete,
  onUpdateDay,
  onDeleteDay,
}: {
  day: PlannerDay;
  canDelete: boolean;
  onUpdateDay?: (dayId: string, patch: DayPatch) => Promise<void> | void;
  onDeleteDay?: (dayId: string) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [titleDraft, setTitleDraft] = useState(day.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleDraft(day.title);
  }, [day.title]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setConfirmDelete(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setConfirmDelete(false);
        setRenaming(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function commitTitle() {
    const next = titleDraft.trim();
    setRenaming(false);
    if (!next || next === day.title || !onUpdateDay) return;
    await onUpdateDay(day.id, { title: next });
  }

  if (!onUpdateDay && !onDeleteDay) return null;

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-label={`Day ${day.dayIndex} options`}
        aria-expanded={open}
        {...tip("Day options")}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          setConfirmDelete(false);
        }}
        className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <MoreHorizontal className="size-4" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            {renaming ? (
              <div className="space-y-2 p-1.5">
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void commitTitle();
                  }}
                  className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Day title"
                />
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    onClick={() => void commitTitle()}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setTitleDraft(day.title);
                      setRenaming(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : confirmDelete ? (
              <div className="space-y-2 p-2">
                <p className="text-sm text-popover-foreground">
                  Delete Day {day.dayIndex}
                  {day.items.length
                    ? ` and its ${day.items.length} stop${day.items.length === 1 ? "" : "s"}`
                    : ""}
                  ? This can&apos;t be undone.
                </p>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      void onDeleteDay?.(day.id);
                      setOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {onUpdateDay ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-popover-foreground hover:bg-secondary"
                    onClick={() => setRenaming(true)}
                  >
                    <Pencil className="size-3.5" />
                    Rename day
                  </button>
                ) : null}
                {onUpdateDay ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-popover-foreground hover:bg-secondary"
                    onClick={() => {
                      void onUpdateDay(day.id, {
                        isRestDay: !day.isRestDay,
                        ...(!day.isRestDay &&
                        (day.title === `Day ${day.dayIndex}` || !day.title)
                          ? { title: "Rest day" }
                          : {}),
                        ...(day.isRestDay && day.title === "Rest day"
                          ? { title: `Day ${day.dayIndex}` }
                          : {}),
                      });
                      setOpen(false);
                    }}
                  >
                    <Coffee className="size-3.5" />
                    {day.isRestDay ? "Unmark rest day" : "Mark as rest day"}
                  </button>
                ) : null}
                {onDeleteDay && canDelete ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete day
                  </button>
                ) : null}
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function ItineraryCanvas({
  days,
  isEditor,
  showTemplates,
  onUpdateItem,
  onDeleteItem,
  onReplaceItem,
  onClearTripStart,
  onUpdateDay,
  onDeleteDay,
  onReorderDay,
  onCustomTravelChange,
  onAddPlace,
  onAddCustomPlace,
  onAddDay,
  onFocusStop,
  activeDayId = null,
  onSelectDay,
}: Props) {
  const [selected, setSelected] = useState<PlannerItem | null>(null);
  const { timeFormat } = useDisplayPrefs();
  const dayRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const skipDayScrollRef = useRef(true);

  const selectedDay = useMemo(
    () =>
      selected
        ? (days.find((d) => d.items.some((i) => i.id === selected.id)) ?? null)
        : null,
    [days, selected],
  );
  const { rows: selectedDayRows } = useDayTimeline(
    selectedDay?.items ?? [],
    timeFormat,
  );
  const selectedRow = selected
    ? (selectedDayRows.find((r) => r.item.id === selected.id) ?? null)
    : null;
  const selectedIsFirstStop = Boolean(
    selected && selectedDay?.items[0]?.id === selected.id,
  );

  // Accordion open state is controlled by shared map/itinerary day selection.
  const openDayId =
    activeDayId && days.some((d) => d.id === activeDayId) ? activeDayId : null;

  useEffect(() => {
    if (!openDayId) return;
    // Skip the initial seed so the page doesn't jump on load.
    if (skipDayScrollRef.current) {
      skipDayScrollRef.current = false;
      return;
    }
    const el = dayRefs.current.get(openDayId);
    if (!el) return;

    let cancelled = false;
    let correctTimer: number | undefined;

    // Match sticky planner header + scroll-mt-* on day cards.
    function headerOffset() {
      return window.matchMedia("(min-width: 640px)").matches ? 112 : 96;
    }

    function alignDay(behavior: ScrollBehavior) {
      if (cancelled) return;
      const top =
        window.scrollY + el.getBoundingClientRect().top - headerOffset();
      window.scrollTo({ top: Math.max(0, top), behavior });
    }

    // Accordion height animates ~280ms; scrolling earlier lands on the wrong Y.
    // Wait for expand/collapse to finish, then align — and nudge once more
    // after layout fully settles (closing previous day still changes height).
    const openTimer = window.setTimeout(() => {
      alignDay("smooth");
      correctTimer = window.setTimeout(() => {
        const drift = Math.abs(
          el.getBoundingClientRect().top - headerOffset(),
        );
        if (drift > 8) alignDay("auto");
      }, 340);
    }, 320);

    return () => {
      cancelled = true;
      window.clearTimeout(openTimer);
      if (correctTimer != null) window.clearTimeout(correctTimer);
    };
  }, [openDayId]);

  const progress = useMemo(() => {
    const all = days.flatMap((d) => d.items);
    const total = all.length;
    const visited = all.filter((i) => i.status === "visited").length;
    return { total, visited };
  }, [days]);

  function toggleDay(id: string) {
    // Accordion: opening another day closes this one. Keep one day open so
    // map ↔ itinerary selection stays aligned.
    if (openDayId === id) return;
    onSelectDay?.(id);
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
        <div className="rounded-2xl bg-secondary/70 px-4 py-3">
          <p className="text-base text-foreground">
            <span className="font-semibold">{progress.visited}</span>
            <span className="text-muted-foreground">
              {" "}
              of {progress.total} stops checked
            </span>
          </p>
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-background">
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
          const open = openDayId === day.id;
          const isRest = !!day.isRestDay;

          return (
            <li
              key={day.id}
              ref={(node) => {
                if (node) dayRefs.current.set(day.id, node);
                else dayRefs.current.delete(day.id);
              }}
              className={cn(
                "scroll-mt-24 overflow-hidden rounded-2xl border shadow-soft sm:scroll-mt-28",
                isRest
                  ? "border-sandstone/50 bg-sandstone/10"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-start gap-1 px-2 py-2 sm:px-3 sm:py-3">
                <button
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className="flex min-w-0 flex-1 items-start justify-between gap-3 px-2 py-2 text-left"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-primary">
                      <span>
                        {formatDayHeading(day.dayIndex, day.date)}
                      </span>
                      {isRest ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sandstone/35 px-2 py-0.5 text-[11px] font-semibold normal-case tracking-normal text-ink">
                          <Coffee className="size-3" />
                          Rest
                        </span>
                      ) : null}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
                      {day.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 break-words text-sm text-muted-foreground sm:text-base">
                      {isRest && !day.items.length
                        ? "Recovery day — no travel planned"
                        : [
                            day.routeSummary,
                            day.items.length
                              ? `${day.items.length} stops`
                              : "No stops",
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

                {isEditor ? (
                  <DayMenu
                    day={day}
                    canDelete={days.length > 1}
                    onUpdateDay={onUpdateDay}
                    onDeleteDay={onDeleteDay}
                  />
                ) : null}
              </div>

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
                      {isRest && !day.items.length ? (
                        <div className="mb-3 rounded-2xl border border-dashed border-sandstone/50 bg-background/50 px-4 py-5 text-center">
                          <Coffee className="mx-auto size-6 text-sandstone" />
                          <p className="mt-2 text-base font-medium text-foreground">
                            Take it easy
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            No stops on this day. Add one below if plans change,
                            or leave it empty for recovery.
                          </p>
                        </div>
                      ) : (
                        <SortableDayStops
                          dayId={day.id}
                          items={day.items}
                          isEditor={isEditor}
                          pinTripStart={day.dayIndex === 1}
                          onToggleVisited={(item) => void toggleVisited(item)}
                          onOpenItem={(item) => {
                            setSelected(item);
                            onSelectDay?.(day.id);
                            onFocusStop?.(item);
                          }}
                          onReorder={(id, orderedIds) => {
                            void onReorderDay(id, orderedIds);
                          }}
                          onUpdateItem={(itemId, patch) => {
                            void onUpdateItem(itemId, patch);
                          }}
                          onReplaceItem={onReplaceItem}
                          searchBias={biasForDay(day)}
                          onDeleteItem={
                            onDeleteItem || onClearTripStart
                              ? (itemId) => {
                                  const target = day.items.find(
                                    (item) => item.id === itemId,
                                  );
                                  if (
                                    day.dayIndex === 1 &&
                                    isTripStartItem(target) &&
                                    onClearTripStart
                                  ) {
                                    void onClearTripStart();
                                    return;
                                  }
                                  void onDeleteItem?.(itemId);
                                }
                              : undefined
                          }
                          onTravelModeChange={(itemId, mode) => {
                            // Google mode wins: clear custom overrides so Maps duration is used.
                            void onUpdateItem(itemId, {
                              travelMode: mode,
                              customTravelDurationMins: null,
                              customTravelDistanceKm: null,
                            });
                          }}
                          onCustomTravelChange={(itemId, patch) => {
                            void onCustomTravelChange?.(itemId, patch);
                          }}
                        />
                      )}

                      {isEditor && onAddPlace && onAddCustomPlace ? (
                        <AddStopSearch
                          dayId={day.id}
                          bias={biasForDay(day)}
                          onAdd={(place, asHotel, timing) =>
                            onAddPlace(day.id, place, asHotel, timing)
                          }
                          onAddCustom={(input) =>
                            onAddCustomPlace(day.id, input)
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

      {isEditor && onAddDay ? (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="w-full text-base sm:w-auto"
            onClick={() => void onAddDay()}
          >
            <Plus className="size-4" />
            Add day
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full text-base sm:w-auto"
            onClick={() => void onAddDay({ isRestDay: true })}
          >
            <Coffee className="size-4" />
            Add rest day
          </Button>
        </div>
      ) : null}

      <PlaceDetailSheet
        item={selected}
        isEditor={isEditor}
        arriveMins={selectedRow?.arriveMins ?? null}
        departMins={selectedRow?.departMins ?? null}
        isFirstStop={selectedIsFirstStop}
        searchBias={selectedDay ? biasForDay(selectedDay) : null}
        dayId={selectedDay?.id}
        onClose={() => setSelected(null)}
        onUpdate={async (itemId, patch) => {
          await onUpdateItem(itemId, patch);
          setSelected((prev) =>
            prev && prev.id === itemId ? { ...prev, ...patch } : prev,
          );
        }}
        onReplace={
          onReplaceItem
            ? async (itemId, next) => {
                await onReplaceItem(itemId, next);
                setSelected((prev) =>
                  prev && prev.id === itemId ? { ...prev, ...next } : prev,
                );
              }
            : undefined
        }
        onDelete={
          onDeleteItem || onClearTripStart
            ? async (itemId) => {
                if (
                  isTripStartItem(selected) &&
                  selectedIsFirstStop &&
                  onClearTripStart
                ) {
                  await onClearTripStart();
                } else {
                  await onDeleteItem?.(itemId);
                }
                setSelected(null);
              }
            : undefined
        }
      />
    </div>
  );
}
