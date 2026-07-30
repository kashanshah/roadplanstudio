import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { itineraryItems, tripDays } from "@/lib/db/schema";
import {
  findOvernightHotel,
  isMorningBaseItem,
  MORNING_BASE_NOTE,
  placeFieldsMatch,
  toOvernightPlaceFields,
  type OvernightPlaceFields,
} from "@/lib/trips/morning-base";

/**
 * Persist Day N+1 morning-base sync after Day N overnight changes.
 */
export async function syncNextDayMorningBaseInDb(opts: {
  tripId: string;
  dayId: string;
  previousOvernight: OvernightPlaceFields | null;
}) {
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

  const overnightItem = findOvernightHotel(dayItems);
  const overnight = overnightItem
    ? toOvernightPlaceFields(overnightItem)
    : null;

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
    (isMorningBaseItem(first) ||
      placeFieldsMatch(first, opts.previousOvernight));

  if (overnight) {
    if (first && linked) {
      await db
        .update(itineraryItems)
        .set({
          name: overnight.name,
          address: overnight.address ?? null,
          latitude: overnight.latitude ?? null,
          longitude: overnight.longitude ?? null,
          googlePlaceId: overnight.googlePlaceId ?? null,
          googleMapsUri: overnight.googleMapsUri ?? null,
          type: "hotel",
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
        type: "hotel",
        name: overnight.name,
        address: overnight.address ?? null,
        latitude: overnight.latitude ?? null,
        longitude: overnight.longitude ?? null,
        googlePlaceId: overnight.googlePlaceId ?? null,
        googleMapsUri: overnight.googleMapsUri ?? null,
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
