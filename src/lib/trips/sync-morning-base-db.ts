import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { itineraryItems, tripDays } from "@/lib/db/schema";
import {
  findDayEndStop,
  isMorningBaseItem,
  MORNING_BASE_NOTE,
  placeFieldsMatch,
  toDayEndPlaceFields,
  type DayEndPlaceFields,
} from "@/lib/trips/morning-base";

function morningBaseType(sourceType: string | undefined): "hotel" | "attraction" | "custom" {
  if (sourceType === "hotel") return "hotel";
  if (sourceType === "custom") return "custom";
  return "attraction";
}

/**
 * Persist Day N+1 morning-base sync after Day N's last stop changes.
 */
export async function syncNextDayMorningBaseInDb(opts: {
  tripId: string;
  dayId: string;
  previousDayEnd: DayEndPlaceFields | null;
  /** @deprecated use previousDayEnd */
  previousOvernight?: DayEndPlaceFields | null;
}) {
  const previousDayEnd = opts.previousDayEnd ?? opts.previousOvernight ?? null;

  const [day] = await db
    .select({
      id: tripDays.id,
      dayIndex: tripDays.dayIndex,
    })
    .from(tripDays)
    .where(and(eq(tripDays.id, opts.dayId), eq(tripDays.tripId, opts.tripId)))
    .limit(1);

  if (!day) return;

  const [nextDay] = await db
    .select({
      id: tripDays.id,
      dayIndex: tripDays.dayIndex,
    })
    .from(tripDays)
    .where(
      and(
        eq(tripDays.tripId, opts.tripId),
        eq(tripDays.dayIndex, day.dayIndex + 1),
      ),
    )
    .limit(1);

  if (!nextDay) return;

  const dayItems = await db
    .select({
      id: itineraryItems.id,
      type: itineraryItems.type,
      sortOrder: itineraryItems.sortOrder,
      status: itineraryItems.status,
      name: itineraryItems.name,
      address: itineraryItems.address,
      latitude: itineraryItems.latitude,
      longitude: itineraryItems.longitude,
      googlePlaceId: itineraryItems.googlePlaceId,
      googleMapsUri: itineraryItems.googleMapsUri,
      notes: itineraryItems.notes,
    })
    .from(itineraryItems)
    .where(eq(itineraryItems.dayId, day.id))
    .orderBy(asc(itineraryItems.sortOrder));

  const endItem = findDayEndStop(dayItems);
  const dayEnd = endItem ? toDayEndPlaceFields(endItem) : null;

  const nextItems = await db
    .select({
      id: itineraryItems.id,
      type: itineraryItems.type,
      sortOrder: itineraryItems.sortOrder,
      name: itineraryItems.name,
      address: itineraryItems.address,
      latitude: itineraryItems.latitude,
      longitude: itineraryItems.longitude,
      googlePlaceId: itineraryItems.googlePlaceId,
      googleMapsUri: itineraryItems.googleMapsUri,
      notes: itineraryItems.notes,
    })
    .from(itineraryItems)
    .where(eq(itineraryItems.dayId, nextDay.id))
    .orderBy(asc(itineraryItems.sortOrder));

  const first = nextItems[0] ?? null;
  const linked =
    !!first &&
    (isMorningBaseItem(first) || placeFieldsMatch(first, previousDayEnd));

  if (dayEnd) {
    const baseType = morningBaseType(dayEnd.type);
    if (first && linked) {
      await db
        .update(itineraryItems)
        .set({
          name: dayEnd.name,
          address: dayEnd.address ?? null,
          latitude: dayEnd.latitude ?? null,
          longitude: dayEnd.longitude ?? null,
          googlePlaceId: dayEnd.googlePlaceId ?? null,
          googleMapsUri: dayEnd.googleMapsUri ?? null,
          type: baseType,
          notes: MORNING_BASE_NOTE,
          durationMins: 0,
        })
        .where(eq(itineraryItems.id, first.id));
      return;
    }

    if (!first) {
      await db.insert(itineraryItems).values({
        dayId: nextDay.id,
        sortOrder: 0,
        type: baseType,
        name: dayEnd.name,
        address: dayEnd.address ?? null,
        latitude: dayEnd.latitude ?? null,
        longitude: dayEnd.longitude ?? null,
        googlePlaceId: dayEnd.googlePlaceId ?? null,
        googleMapsUri: dayEnd.googleMapsUri ?? null,
        notes: MORNING_BASE_NOTE,
        durationMins: 0,
        status: "to_visit",
      });
    }
    return;
  }

  if (first && linked) {
    await db.delete(itineraryItems).where(eq(itineraryItems.id, first.id));

    const remaining = await db
      .select({ id: itineraryItems.id })
      .from(itineraryItems)
      .where(eq(itineraryItems.dayId, nextDay.id))
      .orderBy(asc(itineraryItems.sortOrder));

    for (let i = 0; i < remaining.length; i++) {
      await db
        .update(itineraryItems)
        .set({ sortOrder: i })
        .where(eq(itineraryItems.id, remaining[i]!.id));
    }
  }
}
