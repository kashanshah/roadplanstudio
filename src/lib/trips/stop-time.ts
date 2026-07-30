/** Convert minutes-from-midnight to an `<input type="time">` value. */
export function minsToTimeInput(totalMins: number): string {
  const normalized = ((totalMins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Parse `<input type="time">` value to minutes-from-midnight. */
export function timeInputToMins(value: string): number | null {
  if (!value) return null;
  const [h, m] = value.split(":");
  const hour = Number.parseInt(h ?? "", 10);
  const minute = Number.parseInt(m ?? "", 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

/**
 * Build persistence patch from arrive/depart editors.
 * First stop: arrive becomes day-start arrive_by anchor.
 * Stay is always depart − arrive.
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
      timingMins: ((opts.arriveMins % (24 * 60)) + 24 * 60) % (24 * 60),
    };
  }
  return { durationMins: stay };
}
