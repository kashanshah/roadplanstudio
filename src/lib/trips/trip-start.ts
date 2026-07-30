/** Notes marker used on Day 1's opening itinerary stop. */
export const TRIP_START_NOTE = "Trip start · depart";

export function isTripStartItem(item: {
  notes?: string | null;
} | null | undefined): boolean {
  return (item?.notes ?? "").toLowerCase().includes("trip start");
}

/** Keep the trip-start stop pinned at the front of Day 1. */
export function pinTripStartFirst<
  T extends { id: string; notes?: string | null; sortOrder?: number },
>(items: T[]): T[] {
  const start = items.find((item) => isTripStartItem(item));
  if (!start) return items;
  return [start, ...items.filter((item) => item.id !== start.id)].map(
    (item, index) => ({ ...item, sortOrder: index }),
  );
}
