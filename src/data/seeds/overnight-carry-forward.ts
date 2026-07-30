import { TRIP_START_NOTE } from "@/lib/trips/trip-start";

export { TRIP_START_NOTE };
export const MORNING_BASE_NOTE = "Morning base · depart for the day";

/**
 * Day openings:
 * - Day 1 opens at Trip Start (relabel existing first stop, or prepend `tripStart`)
 * - Later days open at the previous night's lodging (morning base)
 * Each day still ends with its own overnight when present.
 */
export function withDayOpeningBases<
  TDay extends { overnight?: TStop | null; stops: TStop[] },
  TStop extends { key?: string; notes?: string | null },
>(
  days: TDay[],
  opts?: {
    tripStart?: TStop | null;
  },
): TDay[] {
  return days.map((day, index) => {
    if (index === 0) {
      const tripStart = opts?.tripStart;
      if (tripStart) {
        const opening = {
          ...tripStart,
          key: tripStart.key ?? "trip-start",
          notes: TRIP_START_NOTE,
        } as TStop;
        const rest = day.stops.filter((stop, stopIndex) => {
          if (stopIndex === 0 && stop.key && stop.key === opening.key) {
            return false;
          }
          // Drop legacy Day 1 depart stub when replacing with trip start.
          if (stop.key === "d1-drive") return false;
          return true;
        });
        return { ...day, stops: [opening, ...rest] };
      }
      if (day.stops[0]) {
        return {
          ...day,
          stops: [
            { ...day.stops[0], notes: TRIP_START_NOTE } as TStop,
            ...day.stops.slice(1),
          ],
        };
      }
      return day;
    }

    const previousOvernight = days[index - 1]?.overnight ?? null;
    if (!previousOvernight) return day;

    const morningBase = {
      ...previousOvernight,
      key: previousOvernight.key
        ? `${previousOvernight.key}-morning`
        : `day-${index + 1}-morning-base`,
      notes: MORNING_BASE_NOTE,
    } as TStop;

    return {
      ...day,
      stops: [morningBase, ...day.stops],
    };
  });
}

/** @deprecated Use withDayOpeningBases */
export const withMorningBaseFromPreviousOvernight = withDayOpeningBases;
