import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accommodations,
  itineraryItems,
  profiles,
  tripDays,
  trips,
} from "@/lib/db/schema";

export async function getPublicTripBySlug(slug: string) {
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.slug, slug))
    .limit(1);

  if (!trip) return null;
  if (trip.visibility === "private") return null;

  const [owner] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, trip.ownerId))
    .limit(1);

  const days = await db
    .select()
    .from(tripDays)
    .where(eq(tripDays.tripId, trip.id))
    .orderBy(asc(tripDays.dayIndex));

  const dayIds = days.map((d) => d.id);
  const items =
    dayIds.length === 0
      ? []
      : await db
          .select()
          .from(itineraryItems)
          .where(inArray(itineraryItems.dayId, dayIds))
          .orderBy(asc(itineraryItems.sortOrder));

  const lodging = await db
    .select()
    .from(accommodations)
    .where(eq(accommodations.tripId, trip.id));

  return {
    trip,
    owner,
    days: days.map((d) => ({
      ...d,
      items: items.filter((i) => i.dayId === d.id),
    })),
    accommodations: lodging,
  };
}

export async function listPublicTrips(limit = 12) {
  return db
    .select()
    .from(trips)
    .where(eq(trips.visibility, "public"))
    .orderBy(asc(trips.title))
    .limit(limit);
}
