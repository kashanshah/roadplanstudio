/** Notes marker on Day N+1 stop 1 when it mirrors Day N's overnight. */
export const MORNING_BASE_NOTE = "Morning base · depart for the day";

export type OvernightPlaceFields = {
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  googleMapsUri?: string | null;
};

export function isMorningBaseItem(item: {
  notes?: string | null;
} | null | undefined): boolean {
  return (item?.notes ?? "").toLowerCase().includes("morning base");
}

export function placeFieldsMatch(
  a: OvernightPlaceFields | null | undefined,
  b: OvernightPlaceFields | null | undefined,
): boolean {
  if (!a || !b) return false;
  if (a.googlePlaceId && b.googlePlaceId) {
    return a.googlePlaceId === b.googlePlaceId;
  }
  return (
    a.name === b.name &&
    (a.address ?? null) === (b.address ?? null)
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

export function toOvernightPlaceFields(item: {
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  googleMapsUri?: string | null;
}): OvernightPlaceFields {
  return {
    name: item.name,
    address: item.address ?? null,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    googlePlaceId: item.googlePlaceId ?? null,
    googleMapsUri: item.googleMapsUri ?? null,
  };
}

function isLinkedMorningBase<
  T extends OvernightPlaceFields & {
    type?: string;
    notes?: string | null;
  },
>(
  first: T | null | undefined,
  previousOvernight: OvernightPlaceFields | null | undefined,
): boolean {
  if (!first) return false;
  if (isMorningBaseItem(first)) return true;
  if (previousOvernight && placeFieldsMatch(first, previousOvernight)) {
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
 * Keep Day N+1 stop 1 aligned with Day N's overnight lodging.
 * - overnight set + linked opener → update place fields
 * - overnight cleared + linked opener → remove opener
 * - overnight set + empty next day → create morning base
 * - custom (unlinked) next-day opener is left alone
 */
export function syncNextDayMorningBase<
  TItem extends OvernightPlaceFields & {
    id: string;
    type: string;
    notes?: string | null;
    sortOrder?: number;
    durationMins?: number | null;
  },
  TDay extends DayLike<TItem>,
>(
  days: TDay[],
  changedDayId: string,
  opts: {
    /** Overnight place on the changed day *before* this mutation (for matching). */
    previousOvernight: OvernightPlaceFields | null;
    createMorningBase: (place: OvernightPlaceFields) => TItem;
  },
): TDay[] {
  const changed = days.find((day) => day.id === changedDayId);
  if (!changed) return days;

  const nextDay = days.find((day) => day.dayIndex === changed.dayIndex + 1);
  if (!nextDay) return days;

  const nextOvernightItem = findOvernightHotel(changed.items);
  const nextOvernight = nextOvernightItem
    ? toOvernightPlaceFields(nextOvernightItem)
    : null;

  const ordered = [...nextDay.items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const first = ordered[0] ?? null;
  const linked = isLinkedMorningBase(first, opts.previousOvernight);

  if (nextOvernight) {
    if (first && linked) {
      return days.map((day) => {
        if (day.id !== nextDay.id) return day;
        return {
          ...day,
          items: day.items.map((item) =>
            item.id === first.id
              ? {
                  ...item,
                  name: nextOvernight.name,
                  address: nextOvernight.address ?? null,
                  latitude: nextOvernight.latitude ?? null,
                  longitude: nextOvernight.longitude ?? null,
                  googlePlaceId: nextOvernight.googlePlaceId ?? null,
                  googleMapsUri: nextOvernight.googleMapsUri ?? null,
                  type: "hotel",
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
        ...opts.createMorningBase(nextOvernight),
        type: "hotel",
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

  // Overnight cleared — drop the mirrored morning base only.
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
