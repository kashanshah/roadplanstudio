import { NextResponse } from "next/server";
import { and, eq, max, sql } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { accommodations, itineraryItems, tripDays } from "@/lib/db/schema";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";
import { getPlaceDetails } from "@/lib/maps/places";

type Ctx = { params: Promise<{ tripId: string }> };

const createSchema = z.object({
  dayId: z.string().uuid(),
  googlePlaceId: z.string().min(4).max(256).optional(),
  name: z.string().min(1).max(200).optional(),
  type: z.enum(["attraction", "hotel", "custom"]).default("attraction"),
  notes: z.string().max(4000).nullable().optional(),
  durationMins: z.number().int().min(0).max(24 * 60).nullable().optional(),
  timingMode: z.enum(["arrive_by", "depart_at"]).nullable().optional(),
  timingMins: z.number().int().min(0).max(24 * 60 - 1).nullable().optional(),
  customTravelDurationMins: z
    .number()
    .int()
    .min(0)
    .max(24 * 60)
    .nullable()
    .optional(),
  customTravelDistanceKm: z.number().min(0).max(50000).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsUri: z.string().url().nullable().optional(),
  /** When set (e.g. 0 for trip start), insert at that index and shift later stops. */
  sortOrder: z.number().int().min(0).optional(),
});

export async function POST(request: Request, ctx: Ctx) {
  const { tripId } = await ctx.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getTripAccess(tripId, session.user.id);
  try {
    assertCanEdit(access);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [day] = await db
    .select()
    .from(tripDays)
    .where(and(eq(tripDays.id, parsed.data.dayId), eq(tripDays.tripId, tripId)))
    .limit(1);

  if (!day) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
  }

  let placeFields: {
    googlePlaceId: string | null;
    name: string;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    googleMapsUri: string | null;
    durationMins: number | null;
    timingMode: "arrive_by" | "depart_at" | null;
    timingMins: number | null;
    customTravelDurationMins: number | null;
    customTravelDistanceKm: number | null;
  } = {
    googlePlaceId: parsed.data.googlePlaceId ?? null,
    name: parsed.data.name || "New stop",
    address: parsed.data.address ?? null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    googleMapsUri: parsed.data.googleMapsUri ?? null,
    durationMins: parsed.data.durationMins ?? null,
    timingMode: parsed.data.timingMode ?? null,
    timingMins: parsed.data.timingMins ?? null,
    customTravelDurationMins: parsed.data.customTravelDurationMins ?? null,
    customTravelDistanceKm: parsed.data.customTravelDistanceKm ?? null,
  };

  if (parsed.data.googlePlaceId) {
    try {
      const details = await getPlaceDetails(parsed.data.googlePlaceId);
      if (details) {
        placeFields = {
          googlePlaceId: details.placeId,
          name: details.name,
          address: details.formattedAddress,
          latitude: details.latitude,
          longitude: details.longitude,
          googleMapsUri: details.googleMapsUri,
          durationMins:
            parsed.data.durationMins ?? details.estimatedDurationMins,
          timingMode: parsed.data.timingMode ?? null,
          timingMins: parsed.data.timingMins ?? null,
          customTravelDurationMins: parsed.data.customTravelDurationMins ?? null,
          customTravelDistanceKm: parsed.data.customTravelDistanceKm ?? null,
        };
      }
    } catch {
      // Keep client-provided fields if Places lookup fails.
    }
  }

  const [agg] = await db
    .select({ maxSort: max(itineraryItems.sortOrder) })
    .from(itineraryItems)
    .where(eq(itineraryItems.dayId, day.id));

  const appendSort = (agg?.maxSort ?? -1) + 1;
  const sortOrder =
    parsed.data.sortOrder != null
      ? Math.min(parsed.data.sortOrder, appendSort)
      : appendSort;

  if (parsed.data.sortOrder != null) {
    await db
      .update(itineraryItems)
      .set({ sortOrder: sql`${itineraryItems.sortOrder} + 1` })
      .where(
        and(
          eq(itineraryItems.dayId, day.id),
          sql`${itineraryItems.sortOrder} >= ${sortOrder}`,
        ),
      );
  }

  const [item] = await db
    .insert(itineraryItems)
    .values({
      dayId: day.id,
      sortOrder,
      type: parsed.data.type,
      notes: parsed.data.notes ?? null,
      status: "to_visit",
      ...placeFields,
    })
    .returning();

  if (parsed.data.type === "hotel") {
    await db.insert(accommodations).values({
      tripId,
      dayId: day.id,
      googlePlaceId: placeFields.googlePlaceId,
      name: placeFields.name,
      address: placeFields.address,
      latitude: placeFields.latitude,
      longitude: placeFields.longitude,
      googleMapsUri: placeFields.googleMapsUri,
      isConfirmed: "false",
    });
  }

  return NextResponse.json({ item }, { status: 201 });
}

