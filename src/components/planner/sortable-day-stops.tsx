"use client";

import { Fragment, useEffect, useId, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  BedDouble,
  Bike,
  Bus,
  Car,
  ChevronDown,
  ChevronUp,
  Footprints,
  GripVertical,
  Heart,
  MapPin,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Star,
  Trash2,
} from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatDurationLabel,
  useDayTimeline,
  type TimelineRow,
  type TravelLeg,
} from "@/components/planner/use-day-timeline";
import {
  statusLabel,
  type PlannerItem,
  type StopStatus,
  type TravelMode,
} from "@/components/planner/planner-types";
import {
  TRAVEL_MODES,
  travelModeLabel,
  travelModeTitle,
} from "@/lib/maps/travel-mode";
import {
  formatClock,
  useDisplayPrefs,
} from "@/lib/prefs/display-prefs";
import {
  buildStopTimePatch,
  minsToTimeInput,
  timeInputToMins,
} from "@/lib/trips/stop-time";
import {
  isTripStartItem,
  pinTripStartFirst,
} from "@/lib/trips/trip-start";
import { cn } from "@/lib/utils/cn";

type ItemTimePatch = Partial<
  Pick<PlannerItem, "durationMins" | "timingMode" | "timingMins">
>;

type Props = {
  dayId: string;
  items: PlannerItem[];
  isEditor: boolean;
  /** When true (Day 1), trip-start stop stays pinned as stop 1. */
  pinTripStart?: boolean;
  onToggleVisited: (item: PlannerItem) => void;
  onOpenItem: (item: PlannerItem) => void;
  onReorder: (dayId: string, orderedIds: string[]) => void;
  onUpdateItem?: (itemId: string, patch: ItemTimePatch) => void | Promise<void>;
  onDeleteItem?: (itemId: string) => void | Promise<void>;
  onTravelModeChange?: (itemId: string, mode: TravelMode) => void;
  onCustomTravelChange?: (
    itemId: string,
    patch: Pick<
      PlannerItem,
      "customTravelDurationMins" | "customTravelDistanceKm"
    >,
  ) => void;
};

const MODE_ICON = {
  driving: Car,
  walking: Footprints,
  bicycling: Bike,
  transit: Bus,
} as const;

function TravelConnector({
  fromItem,
  leg,
  loading,
  isEditor,
  onTravelModeChange,
  onCustomTravelChange,
}: {
  fromItem: PlannerItem;
  leg: TravelLeg | null;
  loading: boolean;
  isEditor: boolean;
  onTravelModeChange?: (itemId: string, mode: TravelMode) => void;
  onCustomTravelChange?: (
    itemId: string,
    patch: Pick<
      PlannerItem,
      "customTravelDurationMins" | "customTravelDistanceKm"
    >,
  ) => void;
}) {
  const storedMode = (fromItem.travelMode ?? "driving") as TravelMode;
  const mode = (leg?.travelMode ?? storedMode) as TravelMode;
  const hasCustom =
    fromItem.customTravelDurationMins != null ||
    fromItem.customTravelDistanceKm != null;
  const Icon = hasCustom ? SlidersHorizontal : MODE_ICON[mode];
  const [editingCustom, setEditingCustom] = useState(false);
  const [customDurationDraft, setCustomDurationDraft] = useState(
    fromItem.customTravelDurationMins != null
      ? String(fromItem.customTravelDurationMins)
      : "",
  );
  const [customDistanceDraft, setCustomDistanceDraft] = useState(
    fromItem.customTravelDistanceKm != null
      ? String(fromItem.customTravelDistanceKm)
      : "",
  );

  useEffect(() => {
    setCustomDurationDraft(
      fromItem.customTravelDurationMins != null
        ? String(fromItem.customTravelDurationMins)
        : "",
    );
    setCustomDistanceDraft(
      fromItem.customTravelDistanceKm != null
        ? String(fromItem.customTravelDistanceKm)
        : "",
    );
    setEditingCustom(false);
  }, [fromItem.id, fromItem.customTravelDurationMins, fromItem.customTravelDistanceKm]);

  function parseOptionalNumber(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }

  function saveCustomLeg() {
    if (!onCustomTravelChange) return;
    const duration = parseOptionalNumber(customDurationDraft);
    const distance = parseOptionalNumber(customDistanceDraft);
    onCustomTravelChange(fromItem.id, {
      customTravelDurationMins: duration,
      customTravelDistanceKm: distance,
    });
    setEditingCustom(false);
  }

  return (
    <div className="relative py-2 pl-4 sm:pl-[6.75rem]">
      {/* Spine continues the stop-row timeline gutter (center of sm:w-[5.25rem] + px-3). */}
      <span
        aria-hidden
        className="absolute left-1.5 top-0 bottom-0 w-px bg-map-route/50 sm:left-[3.375rem] sm:-translate-x-1/2"
      />
      <div className="flex max-w-full flex-wrap items-center gap-2">
        <div className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-dashed border-map-route/40 bg-secondary/60 px-3 py-1.5 text-sm text-muted-foreground">
          <Icon className="size-3.5 shrink-0 text-map-route" />
          {loading && !leg && !hasCustom ? (
            <span>Calculating route…</span>
          ) : leg ? (
            <>
              <span className="font-medium text-foreground">
                {formatDurationLabel(leg.durationMins)}{" "}
                {hasCustom ? "custom" : travelModeLabel(mode)}
              </span>
              <span aria-hidden>·</span>
              <span>
                {leg.distanceKm >= 10
                  ? `${Math.round(leg.distanceKm)} km`
                  : `${leg.distanceKm} km`}
              </span>
              {!hasCustom && leg.estimated ? (
                <span className="text-xs">(est.)</span>
              ) : null}
            </>
          ) : (
            <span>No route data</span>
          )}
        </div>

        {isEditor && (onTravelModeChange || onCustomTravelChange) ? (
          <div
            role="group"
            aria-label="Travel mode"
            className="inline-flex rounded-full border border-border bg-background p-0.5"
          >
            {onTravelModeChange
              ? TRAVEL_MODES.map((m) => {
                  const ModeIcon = MODE_ICON[m];
                  // Custom overrides Google modes — none of these stay selected.
                  const active = !hasCustom && storedMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      aria-label={travelModeTitle(m)}
                      aria-pressed={active}
                      {...tip(travelModeTitle(m))}
                      onClick={() => {
                        setEditingCustom(false);
                        // Selecting a Google mode clears custom (via parent) and uses Maps.
                        if (m !== storedMode || hasCustom) {
                          onTravelModeChange(fromItem.id, m);
                        }
                      }}
                      className={cn(
                        "grid size-10 place-items-center rounded-full transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <ModeIcon className="size-3.5" />
                    </button>
                  );
                })
              : null}
            {onCustomTravelChange ? (
              <button
                type="button"
                aria-label="Custom travel"
                aria-pressed={hasCustom}
                {...tip("Custom travel")}
                onClick={() => setEditingCustom((prev) => !prev)}
                className={cn(
                  "grid size-10 place-items-center rounded-full transition-colors",
                  hasCustom || editingCustom
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <SlidersHorizontal className="size-3.5" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {editingCustom && isEditor && onCustomTravelChange ? (
        <div className="mt-2 space-y-2 rounded-xl border border-border bg-background p-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="number"
              min={0}
              step={1}
              value={customDurationDraft}
              onChange={(e) => setCustomDurationDraft(e.target.value)}
              placeholder="Travel mins"
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="number"
              min={0}
              step={0.1}
              value={customDistanceDraft}
              onChange={(e) => setCustomDistanceDraft(e.target.value)}
              placeholder="Distance km"
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={saveCustomLeg}
              className="h-10 rounded-lg bg-primary px-3 text-sm text-primary-foreground"
            >
              Save
            </button>
          </div>
          {hasCustom ? (
            <button
              type="button"
              onClick={() => {
                onCustomTravelChange(fromItem.id, {
                  customTravelDurationMins: null,
                  customTravelDistanceKm: null,
                });
                setEditingCustom(false);
              }}
              className="inline-flex h-9 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Clear custom — use Google route
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SortableStopRow({
  row,
  index,
  total,
  isEditor,
  isFirstStop,
  pinTripStart,
  timeFormat,
  onToggleVisited,
  onOpenItem,
  onMove,
  onUpdateItem,
  onDeleteItem,
}: {
  row: TimelineRow;
  index: number;
  total: number;
  isEditor: boolean;
  isFirstStop: boolean;
  pinTripStart: boolean;
  timeFormat: "h12" | "h24";
  onToggleVisited: (item: PlannerItem) => void;
  onOpenItem: (item: PlannerItem) => void;
  onMove: (itemId: string, direction: -1 | 1) => void;
  onUpdateItem?: (itemId: string, patch: ItemTimePatch) => void | Promise<void>;
  onDeleteItem?: (itemId: string) => void | Promise<void>;
}) {
  const item = row.item;
  const isTripStart = pinTripStart && isTripStartItem(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditor || isTripStart });

  const checked = item.status === "visited";
  const isHotel = item.type === "hotel";
  const isCustom = item.type === "custom";
  const overnight = row.arriveMins >= 24 * 60;
  const visitedCheckboxId = useId();

  const [editingTimes, setEditingTimes] = useState(false);
  const [arriveDraft, setArriveDraft] = useState("");
  const [departDraft, setDepartDraft] = useState("");
  const [savingTimes, setSavingTimes] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!editingTimes) return;
    setArriveDraft(minsToTimeInput(row.arriveMins));
    setDepartDraft(minsToTimeInput(row.departMins));
    setTimeError(null);
  }, [editingTimes, row.arriveMins, row.departMins]);

  const draftArriveMins = timeInputToMins(arriveDraft);
  const draftDepartMins = timeInputToMins(departDraft);
  const draftStayMins =
    draftArriveMins != null && draftDepartMins != null
      ? Math.max(0, draftDepartMins - draftArriveMins)
      : null;

  const canEditTimes = Boolean(onUpdateItem) && (!isHotel || isFirstStop);

  async function saveTimes() {
    if (!canEditTimes || !onUpdateItem) return;
    const departMins = timeInputToMins(departDraft);
    // Day-opening stops: schedule anchors at depart (no separate arrive).
    const arriveMins = isFirstStop
      ? departMins
      : timeInputToMins(arriveDraft) ?? row.arriveMins;
    if (arriveMins == null || departMins == null) {
      setTimeError("Enter a valid time.");
      return;
    }
    if (departMins < arriveMins) {
      setTimeError("Depart must be at or after arrive.");
      return;
    }
    setSavingTimes(true);
    setTimeError(null);
    try {
      await onUpdateItem(
        item.id,
        buildStopTimePatch({ arriveMins, departMins, isFirstStop }),
      );
      setEditingTimes(false);
    } finally {
      setSavingTimes(false);
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "relative rounded-2xl bg-transparent",
        isDragging && "z-10 opacity-90 shadow-elevated ring-1 ring-primary/30",
      )}
    >
      <div
        className={cn(
          "group rounded-2xl border border-transparent bg-background/70 px-2 py-3 transition-colors hover:border-border hover:bg-secondary/40 sm:px-3",
          checked && "opacity-70",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {/* Status + timeline gutter: checkbox → arrive → stay → depart */}
          <div className="flex items-start gap-3 sm:w-[5.25rem] sm:shrink-0 sm:flex-col sm:items-center sm:gap-1.5 sm:pt-0.5">
            <label
              htmlFor={visitedCheckboxId}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md md:w-full",
                !isEditor && "cursor-default opacity-70",
              )}
              {...tip(checked ? "Marked visited" : "Mark as visited")}
            >
              <Checkbox
                id={visitedCheckboxId}
                checked={checked}
                disabled={!isEditor}
                onCheckedChange={() => onToggleVisited(item)}
                aria-label={`Mark ${item.name} visited`}
                className="size-5 rounded-[3px]"
              />
              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Done
              </span>
            </label>

            {/* Mobile: morning base / first stop = Depart only; end hotel = Overnight; else Arrive→Depart */}
            <div className="flex min-w-0 flex-1 flex-wrap items-end gap-x-2 gap-y-1 sm:hidden">
              {isHotel && !isFirstStop ? (
                <span className="mb-0.5 text-xs text-muted-foreground">
                  Overnight
                </span>
              ) : (
                <>
                  {!isFirstStop ? (
                    <>
                      <div>
                        <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                          Arrive
                        </p>
                        <p className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-primary">
                          {formatClock(row.arriveMins, timeFormat)}
                        </p>
                      </div>
                      <div className="mb-0.5 flex flex-col items-center px-0.5">
                        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                          {row.stayMins > 0
                            ? formatDurationLabel(row.stayMins)
                            : "—"}
                        </span>
                        <span
                          aria-hidden
                          className="mt-0.5 h-px w-6 bg-border"
                        />
                      </div>
                    </>
                  ) : null}
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                      Depart
                    </p>
                    <p className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-foreground">
                      {formatClock(row.departMins, timeFormat)}
                    </p>
                  </div>
                </>
              )}
              {overnight ? (
                <span className="mb-0.5 text-[10px] uppercase tracking-wide text-destructive">
                  +day
                </span>
              ) : null}
            </div>

            {/* Desktop: morning base / first stop = Depart only; end hotel = Overnight */}
            <div className="hidden w-full flex-col items-center text-center sm:flex">
              {isHotel && !isFirstStop ? (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Overnight
                </p>
              ) : (
                <>
                  {!isFirstStop ? (
                    <>
                      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                        Arrive
                      </p>
                      <p className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-primary">
                        {formatClock(row.arriveMins, timeFormat)}
                      </p>
                      <div
                        aria-hidden
                        className="my-1 h-3 w-px bg-border"
                      />
                      <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
                        {row.stayMins > 0
                          ? formatDurationLabel(row.stayMins)
                          : "—"}
                      </p>
                      <div
                        aria-hidden
                        className="my-1 h-3 w-px bg-border"
                      />
                    </>
                  ) : null}
                  <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Depart
                  </p>
                  <p className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-foreground">
                    {formatClock(row.departMins, timeFormat)}
                  </p>
                </>
              )}
              {overnight ? (
                <span className="mt-1 text-[10px] uppercase tracking-wide text-destructive">
                  +day
                </span>
              ) : null}
              {/* Decorative timeline marker — hollow so it isn’t mistaken for a control */}
              <span
                aria-hidden
                className="mt-1.5 size-2 shrink-0 rounded-full border-2 border-primary/45 bg-background ring-[3px] ring-background"
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <button
                type="button"
                className="group/place min-w-0 flex-1 cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onOpenItem(item)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span
                    className={cn(
                      "break-words text-base font-semibold underline-offset-4 transition-colors group-hover/place:text-primary group-hover/place:underline sm:text-lg",
                      checked && "line-through",
                    )}
                  >
                    {item.name}
                  </span>
                  {isTripStart ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                      <MapPin className="size-3" />
                      Trip start
                    </span>
                  ) : isHotel ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sandstone/25 text-foreground px-2 py-0.5 text-xs font-medium">
                      <BedDouble className="size-3" />
                      Hotel
                    </span>
                  ) : isCustom ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      <MapPin className="size-3" />
                      Custom
                    </span>
                  ) : null}
                  {item.status === "favorite" ? (
                    <Heart className="size-3.5 fill-destructive text-destructive" />
                  ) : null}
                  {item.status !== "to_visit" && item.status !== "visited" ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {statusLabel(item.status as StopStatus)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {isHotel ? (
                    <span className="inline-flex items-center gap-1 text-foreground/80">
                      <BedDouble className="size-3.5" />
                      Overnight stay
                    </span>
                  ) : null}
                  {item.address ? (
                    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                      <MapPin className="size-3.5 shrink-0" />
                      <span className="min-w-0 line-clamp-2 break-words sm:line-clamp-1">
                        {item.address}
                      </span>
                    </span>
                  ) : null}
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

            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
              {isEditor && canEditTimes ? (
                <button
                  type="button"
                  onClick={() => setEditingTimes((prev) => !prev)}
                  className={cn(
                    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
                    editingTimes
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <Pencil className="size-3.5" />
                  Edit times
                </button>
              ) : null}

              {isEditor && total > 1 && !isTripStart ? (
                <div
                  className="flex w-full overflow-hidden rounded-lg border border-border sm:w-auto sm:flex-col"
                  role="group"
                  aria-label={`Reorder ${item.name}`}
                >
                  <button
                    type="button"
                    disabled={index === 0 || (pinTripStart && index === 1)}
                    onClick={() => onMove(item.id, -1)}
                    aria-label={`Move ${item.name} up`}
                    {...tip(
                      pinTripStart && index === 1
                        ? "Trip start stays first"
                        : "Move up",
                    )}
                    className="grid h-9 flex-1 place-items-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 sm:size-8 sm:flex-none"
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "grid h-9 flex-1 touch-none place-items-center border-x border-border text-muted-foreground hover:bg-secondary hover:text-foreground sm:size-8 sm:flex-none sm:border-x-0 sm:border-y",
                      "cursor-grab active:cursor-grabbing",
                      isDragging && "cursor-grabbing bg-secondary",
                    )}
                    aria-label={`Drag to reorder ${item.name}`}
                    {...tip("Drag to reorder")}
                    {...attributes}
                    {...listeners}
                  >
                    <GripVertical className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === total - 1}
                    onClick={() => onMove(item.id, 1)}
                    aria-label={`Move ${item.name} down`}
                    {...tip("Move down")}
                    className="grid h-9 flex-1 place-items-center text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 sm:size-8 sm:flex-none"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              ) : isTripStart ? (
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-right">
                  Fixed · Day 1 start
                </p>
              ) : null}

              {isEditor && onDeleteItem ? (
                confirmDelete ? (
                  <div className="flex w-full flex-col gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 p-2 sm:w-44">
                    <p className="text-xs text-foreground">
                      {isTripStart
                        ? "Clear trip start and remove Day 1 stop 1?"
                        : "Remove this stop?"}
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => {
                          setDeleting(true);
                          void Promise.resolve(onDeleteItem(item.id)).finally(
                            () => setDeleting(false),
                          );
                        }}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-md bg-destructive px-2 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-60"
                      >
                        <Trash2 className="size-3.5" />
                        {deleting ? "…" : isTripStart ? "Clear" : "Delete"}
                      </button>
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => setConfirmDelete(false)}
                        className="inline-flex h-8 flex-1 items-center justify-center rounded-md border border-border bg-background px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    aria-label={
                      isTripStart
                        ? `Clear trip start ${item.name}`
                        : `Delete ${item.name}`
                    }
                    {...tip(
                      isTripStart
                        ? "Clear trip start (Day 1 stop 1)"
                        : "Delete stop",
                    )}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="sm:hidden">
                      {isTripStart ? "Clear" : "Delete"}
                    </span>
                  </button>
                )
              ) : null}
            </div>
          </div>
        </div>

        {editingTimes && isEditor && canEditTimes ? (
          <div className="mt-3 rounded-xl border border-border bg-card/80 p-3">
            <div
              className={cn("grid gap-3", !isFirstStop && "sm:grid-cols-2")}
            >
              {!isFirstStop ? (
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Arrive
                    <span className="font-normal"> · from previous stop</span>
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
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Depart
                </span>
                <input
                  type="time"
                  value={departDraft}
                  onChange={(e) => setDepartDraft(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              </p>
            ) : null}
            {timeError ? (
              <p className="mt-1 text-sm text-destructive" role="alert">
                {timeError}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={savingTimes}
                onClick={() => void saveTimes()}
              >
                {savingTimes ? "Saving…" : "Save times"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={savingTimes}
                onClick={() => setEditingTimes(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function SortableDayStops({
  dayId,
  items,
  isEditor,
  pinTripStart = false,
  onToggleVisited,
  onOpenItem,
  onReorder,
  onUpdateItem,
  onDeleteItem,
  onTravelModeChange,
  onCustomTravelChange,
}: Props) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const { timeFormat } = useDisplayPrefs();

  const {
    rows,
    visitMins,
    travelMins,
    totalMins,
    overDay,
    startClock,
    endClock,
    daySpanHours,
    loading,
  } = useDayTimeline(localItems, timeFormat);

  const rowById = useMemo(
    () => new Map(rows.map((r) => [r.item.id, r])),
    [rows],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function commitOrder(next: PlannerItem[]) {
    const ordered = pinTripStart ? pinTripStartFirst(next) : next;
    setLocalItems(ordered);
    onReorder(
      dayId,
      ordered.map((i) => i.id),
    );
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    commitOrder(arrayMove(localItems, oldIndex, newIndex));
  }

  function onMove(itemId: string, direction: -1 | 1) {
    const index = localItems.findIndex((i) => i.id === itemId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= localItems.length) return;
    commitOrder(arrayMove(localItems, index, target));
  }

  if (!localItems.length) {
    return (
      <p className="px-1 py-3 text-base text-muted-foreground">
        {pinTripStart
          ? "Set Trip start above — it becomes Day 1 stop 1. Then add places from search."
          : "Empty day — add a stop from Places search."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "rounded-2xl border px-3 py-3 sm:px-4",
          overDay
            ? "border-destructive/40 bg-destructive/10"
            : "border-border bg-secondary/50",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base">
          <span className="font-medium text-foreground">
            {startClock} → {endClock}
          </span>
          <span className="text-muted-foreground">
            {formatDurationLabel(totalMins)} total
          </span>
          <span className="text-muted-foreground">
            · {formatDurationLabel(travelMins)} travel
          </span>
          <span className="text-muted-foreground">
            · {formatDurationLabel(visitMins)} on site
          </span>
          {loading ? (
            <span className="text-muted-foreground">· updating routes…</span>
          ) : null}
        </div>
        {overDay ? (
          <p
            role="alert"
            className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-destructive sm:text-base"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              This day runs about {daySpanHours} hours — more than a full day.
              It isn&apos;t realistic as scheduled. Shorten stops, skip optional
              places, or split the route across another day.
            </span>
          </p>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={localItems.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="relative space-y-0">
            {localItems.map((item, index) => {
              const row = rowById.get(item.id) ?? {
                item,
                arriveMins: 8 * 60,
                stayMins: item.durationMins ?? 60,
                departMins: 8 * 60,
                legAfter: null,
              };
              return (
                <Fragment key={item.id}>
                  <SortableStopRow
                    row={row}
                    index={index}
                    total={localItems.length}
                    isEditor={isEditor}
                    isFirstStop={index === 0}
                    pinTripStart={pinTripStart}
                    timeFormat={timeFormat}
                    onToggleVisited={onToggleVisited}
                    onOpenItem={onOpenItem}
                    onMove={onMove}
                    onUpdateItem={onUpdateItem}
                    onDeleteItem={onDeleteItem}
                  />
                  {index < localItems.length - 1 ? (
                    <li className="list-none">
                      <TravelConnector
                        fromItem={item}
                        leg={row.legAfter}
                        loading={loading}
                        isEditor={isEditor}
                        onTravelModeChange={onTravelModeChange}
                        onCustomTravelChange={onCustomTravelChange}
                      />
                    </li>
                  ) : null}
                </Fragment>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
