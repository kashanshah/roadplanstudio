/** Notes marker on Day N+1 stop 1 when it mirrors Day N's last stop. */
export const MORNING_BASE_NOTE = "Morning base · depart for the day";

export type DayEndPlaceFields = {
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  googleMapsUri?: string | null;
  /** Source stop type — morning base keeps this (hotel only if end was lodging). */
  type?: string;
};

/** @deprecated Use DayEndPlaceFields */
export type OvernightPlaceFields = DayEndPlaceFields;

export function isMorningBaseItem(item: {
  notes?: string | null;
} | null | undefined): boolean {
  return (item?.notes ?? "").toLowerCase().includes("morning base");
}

function isActiveStop(item: { status?: string | null }): boolean {
  return item.status !== "skipped" && item.status !== "cancelled";
}

export function placeFieldsMatch(
  a: DayEndPlaceFields | null | undefined,
  b: DayEndPlaceFields | null | undefined,
): boolean {
  if (!a || !b) return false;
  if (a.googlePlaceId && b.googlePlaceId) {
    return a.googlePlaceId === b.googlePlaceId;
  }
  return (
    a.name === b.name && (a.address ?? null) === (b.address ?? null)
  );
}

/** End-of-day lodging: last hotel that isn't the day's first stop. */
export function findOvernightHotel<
  T extends { type: string; sortOrder?: number },
>(items: T[]): T | null {
  const ordered = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (ordered[i]!.type === "hotel" && i > 0) return ordered[i]!;
  }
  return null;
}

/**
 * Last meaningful stop on a day — becomes the next day's morning base.
 * Skips cancelled/skipped stops.
 */
export function findDayEndStop<
  T extends {
    type: string;
    sortOrder?: number;
    status?: string | null;
  },
>(items: T[]): T | null {
  const ordered = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  for (let i = ordered.length - 1; i >= 0; i--) {
    const item = ordered[i]!;
    if (!isActiveStop(item)) continue;
    return item;
  }
  return null;
}

export function toDayEndPlaceFields(item: {
  name: string;
  type?: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  googleMapsUri?: string | null;
}): DayEndPlaceFields {
  return {
    name: item.name,
    type: item.type,
    address: item.address ?? null,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    googlePlaceId: item.googlePlaceId ?? null,
    googleMapsUri: item.googleMapsUri ?? null,
  };
}

/** @deprecated Use toDayEndPlaceFields */
export const toOvernightPlaceFields = toDayEndPlaceFields;

function morningBaseType(sourceType: string | undefined): string {
  if (sourceType === "hotel") return "hotel";
  if (sourceType === "custom") return "custom";
  return "attraction";
}

function isLinkedMorningBase<
  T extends DayEndPlaceFields & {
    type?: string;
    notes?: string | null;
  },
>(
  first: T | null | undefined,
  previousDayEnd: DayEndPlaceFields | null | undefined,
): boolean {
  if (!first) return false;
  if (isMorningBaseItem(first)) return true;
  if (previousDayEnd && placeFieldsMatch(first, previousDayEnd)) {
    return true;
  }
  return false;
}

type DayLike<TItem> = {
  id: string;
  dayIndex: number;
  items: TItem[];
};

/**
 * Keep Day N+1 stop 1 aligned with Day N's last active stop.
 * - day-end set + linked opener → update place fields
 * - day-end cleared + linked opener → remove opener
 * - day-end set + empty next day → create morning base
 * - custom (unlinked) next-day opener is left alone
 */
export function syncNextDayMorningBase<
  TItem extends DayEndPlaceFields & {
    id: string;
    type: string;
    notes?: string | null;
    sortOrder?: number;
    durationMins?: number | null;
    status?: string | null;
  },
  TDay extends DayLike<TItem>,
>(
  days: TDay[],
  changedDayId: string,
  opts: {
    /** Day-end place on the changed day *before* this mutation (for matching). */
    previousDayEnd: DayEndPlaceFields | null;
    createMorningBase: (place: DayEndPlaceFields) => TItem;
  },
): TDay[] {
  const changed = days.find((day) => day.id === changedDayId);
  if (!changed) return days;

  const nextDay = days.find((day) => day.dayIndex === changed.dayIndex + 1);
  if (!nextDay) return days;

  const nextEndItem = findDayEndStop(changed.items);
  const nextEnd = nextEndItem ? toDayEndPlaceFields(nextEndItem) : null;

  const ordered = [...nextDay.items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const first = ordered[0] ?? null;
  const linked = isLinkedMorningBase(first, opts.previousDayEnd);

  if (nextEnd) {
    const baseType = morningBaseType(nextEnd.type);
    if (first && linked) {
      return days.map((day) => {
        if (day.id !== nextDay.id) return day;
        return {
          ...day,
          items: day.items.map((item) =>
            item.id === first.id
              ? {
                  ...item,
                  name: nextEnd.name,
                  address: nextEnd.address ?? null,
                  latitude: nextEnd.latitude ?? null,
                  longitude: nextEnd.longitude ?? null,
                  googlePlaceId: nextEnd.googlePlaceId ?? null,
                  googleMapsUri: nextEnd.googleMapsUri ?? null,
                  type: baseType,
                  notes: MORNING_BASE_NOTE,
                  durationMins: 0,
                }
              : item,
          ),
        };
      });
    }

    if (!first) {
      const created = {
        ...opts.createMorningBase(nextEnd),
        type: baseType,
        notes: MORNING_BASE_NOTE,
        durationMins: 0,
        sortOrder: 0,
      } as TItem;
      return days.map((day) => {
        if (day.id !== nextDay.id) return day;
        return {
          ...day,
          items: [
            created,
            ...day.items.map((item, index) => ({
              ...item,
              sortOrder: index + 1,
            })),
          ],
        };
      });
    }

    return days;
  }

  // Day emptied — drop the mirrored morning base only.
  if (first && linked) {
    return days.map((day) => {
      if (day.id !== nextDay.id) return day;
      return {
        ...day,
        items: day.items
          .filter((item) => item.id !== first.id)
          .map((item, index) => ({ ...item, sortOrder: index })),
      };
    });
  }

  return days;
}
