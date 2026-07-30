export const MINUTES_PER_DAY = 24 * 60;

/** Convert minutes-from-midnight to an `<input type="time">` value. */
export function minsToTimeInput(totalMins: number): string {
  const normalized = wallClockMins(totalMins);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse `<input type="time">` value to minutes-from-midnight (0–1439). */
export function timeInputToMins(value: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(":");
  const hour = Number.parseInt(h ?? "", 10);
  const minute = Number.parseInt(m ?? "", 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

/** Whole days past the trip-day midnight (0 = same day, 1 = next morning, …). */
export function dayOffsetFromMins(totalMins: number): number {
  if (!Number.isFinite(totalMins)) return 0;
  return Math.max(0, Math.floor(totalMins / MINUTES_PER_DAY));
}

/** Wall-clock minutes within a day (0–1439). */
export function wallClockMins(totalMins: number): number {
  return ((totalMins % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/**
 * Resolve a wall-clock depart time against a continuous arrive cursor.
 * If the wall clock is earlier than arrive on that calendar slice,
 * treat depart as the next day (e.g. arrive 2:00 AM +1 → depart 10:00 AM +1).
 */
export function resolveDepartAfterArrive(
  arriveContinuous: number,
  departWallClock: number,
): number {
  const arriveDay = Math.floor(arriveContinuous / MINUTES_PER_DAY);
  let depart = arriveDay * MINUTES_PER_DAY + departWallClock;
  if (depart < arriveContinuous) {
    depart += MINUTES_PER_DAY;
  }
  return depart;
}

/**
 * Build persistence patch from arrive/depart editors.
 * First stop: arrive becomes day-start arrive_by anchor.
 * Stay is always depart − arrive (continuous minutes).
 */
export function buildStopTimePatch(opts: {
  arriveMins: number;
  departMins: number;
  isFirstStop: boolean;
}): {
  durationMins: number;
  timingMode?: "arrive_by";
  timingMins?: number;
} {
  const stay = Math.max(0, opts.departMins - opts.arriveMins);
  if (opts.isFirstStop) {
    return {
      durationMins: stay,
      timingMode: "arrive_by",
      timingMins: wallClockMins(opts.arriveMins),
    };
  }
  return { durationMins: stay };
}
