"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
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
  Car,
  ChevronDown,
  ChevronUp,
  Clock,
  GripVertical,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
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
} from "@/components/planner/planner-types";
import {
  formatClock,
  useDisplayPrefs,
} from "@/lib/prefs/display-prefs";
import { cn } from "@/lib/utils/cn";

type Props = {
  dayId: string;
  items: PlannerItem[];
  isEditor: boolean;
  onToggleVisited: (item: PlannerItem) => void;
  onOpenItem: (item: PlannerItem) => void;
  onReorder: (dayId: string, orderedIds: string[]) => void;
};

function TravelConnector({ leg, loading }: { leg: TravelLeg | null; loading: boolean }) {
  if (!leg && !loading) {
    return (
      <div className="relative ml-[2.85rem] flex items-center gap-2 py-1.5 sm:ml-[3.35rem]">
        <span className="absolute -left-[1.15rem] top-0 bottom-0 w-px bg-border sm:-left-[1.35rem]" />
        <span className="text-xs text-muted-foreground">No route data</span>
      </div>
    );
  }

  return (
    <div className="relative ml-[2.85rem] py-2 sm:ml-[3.35rem]">
      <span className="absolute -left-[1.15rem] top-0 bottom-0 w-px bg-map-route/50 sm:-left-[1.35rem]" />
      <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-dashed border-map-route/40 bg-secondary/60 px-3 py-1.5 text-sm text-muted-foreground">
        <Car className="size-3.5 shrink-0 text-map-route" />
        {loading && !leg ? (
          <span>Calculating drive…</span>
        ) : leg ? (
          <>
            <span className="font-medium text-foreground">
              {formatDurationLabel(leg.durationMins)} drive
            </span>
            <span aria-hidden>·</span>
            <span>
              {leg.distanceKm >= 10
                ? `${Math.round(leg.distanceKm)} km`
                : `${leg.distanceKm} km`}
            </span>
            {leg.estimated ? (
              <span className="text-xs">(est.)</span>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function SortableStopRow({
  row,
  index,
  total,
  isEditor,
  timeFormat,
  onToggleVisited,
  onOpenItem,
  onMove,
}: {
  row: TimelineRow;
  index: number;
  total: number;
  isEditor: boolean;
  timeFormat: "h12" | "h24";
  onToggleVisited: (item: PlannerItem) => void;
  onOpenItem: (item: PlannerItem) => void;
  onMove: (itemId: string, direction: -1 | 1) => void;
}) {
  const item = row.item;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isEditor });

  const checked = item.status === "visited";
  const isHotel = item.type === "hotel";
  const overnight = row.arriveMins >= 24 * 60;

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
          "group flex items-start gap-2 rounded-2xl border border-transparent bg-background/70 px-1.5 py-3 transition-colors hover:border-border hover:bg-secondary/40 sm:gap-3 sm:px-3",
          checked && "opacity-70",
        )}
      >
        <div className="flex w-12 shrink-0 flex-col items-center pt-0.5 sm:w-14">
          <span className="font-mono text-xs font-semibold tabular-nums text-primary sm:text-sm">
            {formatClock(row.arriveMins, timeFormat)}
          </span>
          {overnight ? (
            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-destructive">
              +day
            </span>
          ) : null}
          <span className="mt-2 grid size-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
        </div>

        {isEditor ? (
          <button
            type="button"
            className={cn(
              "mt-1 touch-none rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground",
              "cursor-grab active:cursor-grabbing",
              isDragging && "cursor-grabbing",
            )}
            aria-label={`Drag to reorder ${item.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : null}

        <Checkbox
          checked={checked}
          disabled={!isEditor}
          onCheckedChange={() => onToggleVisited(item)}
          aria-label={`Mark ${item.name} visited`}
          className="mt-1"
        />

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpenItem(item)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {index + 1}.
            </span>
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
            ) : (
              <span className="inline-flex items-center gap-1 text-foreground/80">
                <Clock className="size-3.5 text-primary" />
                {row.stayMins > 0
                  ? `${formatDurationLabel(row.stayMins)} at location`
                  : "No time at location"}
              </span>
            )}
            {item.address ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                <span className="line-clamp-1">{item.address}</span>
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

        {isEditor && total > 1 ? (
          <div className="mt-0.5 flex shrink-0 flex-col gap-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(item.id, -1)}
              aria-label={`Move ${item.name} up`}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMove(item.id, 1)}
              aria-label={`Move ${item.name} down`}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
            >
              <ChevronDown className="size-4" />
            </button>
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
  onToggleVisited,
  onOpenItem,
  onReorder,
}: Props) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const { timeFormat, setTimeFormat } = useDisplayPrefs();

  const {
    rows,
    visitMins,
    driveMins,
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
    setLocalItems(next);
    onReorder(
      dayId,
      next.map((i) => i.id),
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
        Empty day — add a stop from Places search.
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base">
            <span className="font-medium text-foreground">
              {startClock} → {endClock}
            </span>
            <span className="text-muted-foreground">
              {formatDurationLabel(totalMins)} total
            </span>
            <span className="text-muted-foreground">
              · {formatDurationLabel(driveMins)} driving
            </span>
            <span className="text-muted-foreground">
              · {formatDurationLabel(visitMins)} on site
            </span>
            {loading ? (
              <span className="text-muted-foreground">· updating routes…</span>
            ) : null}
          </div>
          <div className="flex rounded-full border border-border bg-background p-0.5">
            <button
              type="button"
              onClick={() => setTimeFormat("h12")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                timeFormat === "h12"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={timeFormat === "h12"}
            >
              AM/PM
            </button>
            <button
              type="button"
              onClick={() => setTimeFormat("h24")}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                timeFormat === "h24"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={timeFormat === "h24"}
            >
              24h
            </button>
          </div>
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
                    timeFormat={timeFormat}
                    onToggleVisited={onToggleVisited}
                    onOpenItem={onOpenItem}
                    onMove={onMove}
                  />
                  {index < localItems.length - 1 ? (
                    <li className="list-none">
                      <TravelConnector
                        leg={row.legAfter}
                        loading={loading}
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
