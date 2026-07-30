import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accommodations,
  activityLogs,
  itineraryItems,
  tripDays,
  trips,
} from "@/lib/db/schema";
import { getTripTemplate } from "@/data/trips/templates";
import { westernCanadaStaticTemplateSource } from "@/data/seeds/western-canada-template";
import { ensureProfile } from "@/lib/trips/ensure-profile";
import type { GuestDay, GuestTripDraft } from "@/lib/trips/guest-trip";

type TemplateSource = {
  trip: {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    coverPhotoUrl: string | null;
    durationDays: number;
    totalDistanceKm: number | null;
    difficulty: "easy" | "moderate" | "hard";
    visibility: "private" | "unlisted" | "public";
  };
  days: Array<{
    id: string;
    dayIndex: number;
    date: string | null;
    title: string;
    notes: string | null;
    routeSummary: string | null;
    isRestDay: string | null;
    items: Array<{
      id: string;
      dayId: string;
      sortOrder: number | null;
      type: "attraction" | "hotel" | "custom";
      googlePlaceId: string | null;
      name: string;
      address: string | null;
      latitude: number | null;
      longitude: number | null;
      durationMins: number | null;
      timingMode: "arrive_by" | "depart_at" | null;
      timingMins: number | null;
      customTravelDurationMins: number | null;
      customTravelDistanceKm: number | null;
      travelMode: "driving" | "walking" | "bicycling" | "transit" | null;
      status: "to_visit" | "visited" | "skipped" | "cancelled" | "favorite";
      notes: string | null;
      googleMapsUri: string | null;
    }>;
  }>;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_RE.test(value);
}

function loadStaticTemplateTrip(slug: string): TemplateSource | null {
  // Prefer the Places-resolved Western Canada seed over the thin marketing stub.
  if (slug === "western-canada-2026") {
    return westernCanadaStaticTemplateSource() as TemplateSource;
  }

  const template = getTripTemplate(slug);
  if (!template) {
    return null;
  }

  const days: TemplateSource["days"] = template.days.map((day, dayIndex) => {
    const dayId = `template:${template.slug}:day:${dayIndex + 1}`;
    return {
      id: dayId,
      dayIndex: dayIndex + 1,
      date: null,
      title: day.title,
      notes: day.summary,
      routeSummary: day.summary,
      isRestDay: "false",
      items: day.stops.map((stop, stopIndex) => ({
        id: `${dayId}:item:${stopIndex + 1}`,
        dayId,
        sortOrder: stopIndex,
        type: stop.type === "lodging" ? "hotel" : "attraction",
        googlePlaceId: null,
        name: stop.name,
        address: null,
        latitude: stop.lat,
        longitude: stop.lng,
        durationMins: null,
        timingMode: null,
        timingMins: null,
        customTravelDurationMins: null,
        customTravelDistanceKm: null,
        travelMode: "driving",
        status: "to_visit",
        notes: stop.note ?? null,
        googleMapsUri: null,
      })),
    };
  });

  // Static marketing templates often include only a sample day spine.
  // Expand to the advertised duration so remixing opens a full itinerary.
  while (days.length < template.durationDays) {
    const dayIndex = days.length + 1;
    const dayId = `template:${template.slug}:day:${dayIndex}`;
    days.push({
      id: dayId,
      dayIndex,
      date: null,
      title: `Day ${dayIndex}`,
      notes: null,
      routeSummary: null,
      isRestDay: "false",
      items: [],
    });
  }

  return {
    trip: {
      id: `template:${template.slug}`,
      slug: template.slug,
      title: template.title,
      description: template.description,
      coverPhotoUrl: template.coverImage,
      durationDays: template.durationDays,
      totalDistanceKm: template.totalDistanceKm,
      difficulty: template.difficulty,
      visibility: "public",
    },
    days,
  };
}

export async function loadTemplateTrip(
  slug: string,
): Promise<TemplateSource | null> {
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
  } satisfies TemplateSource;
}

export async function loadTemplateTripWithFallback(
  slug: string,
): Promise<TemplateSource | null> {
  try {
    const dbTemplate = await loadTemplateTrip(slug);
    if (dbTemplate) {
      return dbTemplate;
    }
  } catch (err) {
    // Production may have schema/data drift; public pages already catch this.
    // Remix must still succeed from static templates.
    console.error("loadTemplateTrip failed; falling back to static", {
      slug,
      err,
    });
  }

  return loadStaticTemplateTrip(slug);
}

/**
 * Guest draft resolver: prefer the seeded public DB trip when available so
 * Start planning gets the full itinerary. Fall back to static catalog (and for
 * Western Canada, the Places-resolved seed) when DB is unavailable.
 */
export async function loadTemplateForGuestDraft(
  slug: string,
): Promise<TemplateSource | null> {
  return loadTemplateTripWithFallback(slug);
}

/** Public/guest-safe draft shape for remixing a template locally. */
export function templateToGuestDraft(data: TemplateSource): GuestTripDraft {
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
      customTravelDurationMins: item.customTravelDurationMins,
      customTravelDistanceKm: item.customTravelDistanceKm,
      travelMode: item.travelMode ?? "driving",
      status: item.status,
      notes: item.notes,
    })),
  }));

  const day1First = days[0]?.items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return {
    guestToken: crypto.randomUUID(),
    title: `${data.trip.title} (remix)`,
    description: data.trip.description ?? undefined,
    durationDays: data.trip.durationDays,
    startLocation: day1First?.name,
    startPlaceId: day1First?.googlePlaceId ?? null,
    startAddress: day1First?.address ?? null,
    startLatitude: day1First?.latitude ?? null,
    startLongitude: day1First?.longitude ?? null,
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
  const source = await loadTemplateTripWithFallback(opts.slug);
  if (!source) {
    throw new Error("TEMPLATE_NOT_FOUND");
  }

  await ensureProfile({ id: opts.userId, name: opts.userName });

  const day1First = source.days
    .slice()
    .sort((a, b) => a.dayIndex - b.dayIndex)[0]
    ?.items.slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];

  const [created] = await db
    .insert(trips)
    .values({
      ownerId: opts.userId,
      title: `${source.trip.title} (copy)`,
      description: source.trip.description,
      coverPhotoUrl: source.trip.coverPhotoUrl,
      startPlaceId: day1First?.googlePlaceId ?? null,
      startPlaceName: day1First?.name ?? null,
      startAddress: day1First?.address ?? null,
      startLatitude: day1First?.latitude ?? null,
      startLongitude: day1First?.longitude ?? null,
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
          customTravelDurationMins: item.customTravelDurationMins ?? null,
          customTravelDistanceKm: item.customTravelDistanceKm ?? null,
          travelMode: item.travelMode ?? "driving",
          status: item.status,
          notes: item.notes,
          googleMapsUri: item.googleMapsUri,
        })),
      );
    }

    // Static template day ids are not UUIDs — skip lodging lookup for those.
    if (isUuid(day.id)) {
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
  }

  await db.insert(activityLogs).values({
    tripId: created.id,
    userId: opts.userId,
    action: "trip.duplicated",
    metadata: { fromSlug: opts.slug, fromTripId: source.trip.id },
  });

  return created;
}
