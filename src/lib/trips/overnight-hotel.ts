/**
 * When `keepItemId` becomes the overnight hotel, demote other overnight
 * hotels on the same day to attractions. Preserves morning-base hotel
 * (first stop) when the new hotel is not the first stop.
 */
export function demoteOtherOvernightHotels<
  T extends { id: string; type: string; sortOrder?: number },
>(items: T[], keepItemId: string): T[] {
  const ordered = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const keepIndex = ordered.findIndex((item) => item.id === keepItemId);
  if (keepIndex < 0) return items;

  const keepIsFirst = keepIndex === 0;

  return items.map((item) => {
    if (item.id === keepItemId || item.type !== "hotel") return item;
    const index = ordered.findIndex((row) => row.id === item.id);
    const otherIsFirst = index === 0;
    // Setting overnight → clear other overnights; keep morning base.
    if (!keepIsFirst && !otherIsFirst) {
      return { ...item, type: "attraction" } as T;
    }
    // Setting morning base → don't touch the end-of-day overnight.
    if (keepIsFirst && otherIsFirst) {
      return { ...item, type: "attraction" } as T;
    }
    return item;
  });
}
