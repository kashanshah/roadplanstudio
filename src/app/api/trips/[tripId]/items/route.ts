import { NextResponse } from "next/server";
import { and, eq, max } from "drizzle-orm";
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
  address: z.string().max(500).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsUri: z.string().url().nullable().optional(),
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
  } = {
    googlePlaceId: parsed.data.googlePlaceId ?? null,
    name: parsed.data.name || "New stop",
    address: parsed.data.address ?? null,
    latitude: parsed.data.latitude ?? null,
    longitude: parsed.data.longitude ?? null,
    googleMapsUri: parsed.data.googleMapsUri ?? null,
    durationMins: parsed.data.durationMins ?? null,
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

  const sortOrder = (agg?.maxSort ?? -1) + 1;

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

