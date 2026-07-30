import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accommodations,
  activityLogs,
  itineraryItems,
  tripDays,
  trips,
} from "@/lib/db/schema";
import { ensureProfile } from "@/lib/trips/ensure-profile";
import type { GuestDay, GuestTripDraft } from "@/lib/trips/guest-trip";

export async function loadTemplateTrip(slug: string) {
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.slug, slug))
    .limit(1);

  if (!trip) return null;
  if (trip.visibility === "private") return null;

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

  return {
    trip,
    days: days.map((d) => ({
      ...d,
      items: items.filter((i) => i.dayId === d.id),
    })),
  };
}

/** Public/guest-safe draft shape for remixing a template locally. */
export function templateToGuestDraft(
  data: NonNullable<Awaited<ReturnType<typeof loadTemplateTrip>>>,
): GuestTripDraft {
  const days: GuestDay[] = data.days.map((day) => ({
    id: crypto.randomUUID(),
    dayIndex: day.dayIndex,
    date: day.date,
    title: day.title,
    notes: day.notes,
    routeSummary: day.routeSummary,
    isRestDay: day.isRestDay === "true",
    items: day.items.map((item, index) => ({
      id: crypto.randomUUID(),
      sortOrder: item.sortOrder ?? index,
      type: item.type,
      name: item.name,
      address: item.address,
      latitude: item.latitude,
      longitude: item.longitude,
      googlePlaceId: item.googlePlaceId,
      durationMins: item.durationMins,
        timingMode: item.timingMode,
        timingMins: item.timingMins,
      travelMode: item.travelMode ?? "driving",
      status: item.status,
      notes: item.notes,
    })),
  }));

  return {
    guestToken: crypto.randomUUID(),
    title: `${data.trip.title} (remix)`,
    description: data.trip.description ?? undefined,
    durationDays: data.trip.durationDays,
    days,
    updatedAt: new Date().toISOString(),
  };
}

/** Deep-copy a public/unlisted template into the user's account. */
export async function duplicateTemplateForUser(opts: {
  slug: string;
  userId: string;
  userName?: string | null;
}) {
  const source = await loadTemplateTrip(opts.slug);
  if (!source) {
    throw new Error("TEMPLATE_NOT_FOUND");
  }

  await ensureProfile({ id: opts.userId, name: opts.userName });

  const [created] = await db
    .insert(trips)
    .values({
      ownerId: opts.userId,
      title: `${source.trip.title} (copy)`,
      description: source.trip.description,
      coverPhotoUrl: source.trip.coverPhotoUrl,
      durationDays: source.trip.durationDays,
      totalDistanceKm: source.trip.totalDistanceKm,
      difficulty: source.trip.difficulty,
      visibility: "private",
      lastEditedBy: opts.userId,
    })
    .returning();

  for (const day of source.days) {
    const [createdDay] = await db
      .insert(tripDays)
      .values({
        tripId: created.id,
        dayIndex: day.dayIndex,
        date: day.date,
        title: day.title,
        notes: day.notes,
        routeSummary: day.routeSummary,
        isRestDay: day.isRestDay ?? "false",
      })
      .returning();

    if (day.items.length) {
      await db.insert(itineraryItems).values(
        day.items.map((item, index) => ({
          dayId: createdDay.id,
          sortOrder: item.sortOrder ?? index,
          type: item.type,
          googlePlaceId: item.googlePlaceId,
          name: item.name,
          address: item.address,
          latitude: item.latitude,
          longitude: item.longitude,
          durationMins: item.durationMins,
          timingMode: item.timingMode ?? null,
          timingMins: item.timingMins ?? null,
          travelMode: item.travelMode ?? "driving",
          status: item.status,
          notes: item.notes,
          googleMapsUri: item.googleMapsUri,
        })),
      );
    }

    const lodging = await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.dayId, day.id));

    for (const stay of lodging) {
      await db.insert(accommodations).values({
        tripId: created.id,
        dayId: createdDay.id,
        googlePlaceId: stay.googlePlaceId,
        name: stay.name,
        address: stay.address,
        latitude: stay.latitude,
        longitude: stay.longitude,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        bookingDetails: stay.bookingDetails,
        googleMapsUri: stay.googleMapsUri,
        isConfirmed: stay.isConfirmed,
      });
    }
  }

  await db.insert(activityLogs).values({
    tripId: created.id,
    userId: opts.userId,
    action: "trip.duplicated",
    metadata: { fromSlug: opts.slug, fromTripId: source.trip.id },
  });

  return created;
}
