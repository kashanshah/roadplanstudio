/** Parse YYYY-MM-DD (or Date-parsable) without timezone shift for calendar days. */
function parseTripDayDate(value: string): Date | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** e.g. "Sat, Aug 1" — includes weekday ("Day") next to the calendar date. */
export function formatTripDayDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = parseTripDayDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** e.g. "Day 1 · Sat, Aug 1" */
export function formatDayHeading(
  dayIndex: number,
  date: string | null | undefined,
): string {
  const formatted = formatTripDayDate(date);
  return formatted ? `Day ${dayIndex} · ${formatted}` : `Day ${dayIndex}`;
}
