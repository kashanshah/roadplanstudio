import { NextResponse } from "next/server";
import { and, asc, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { accommodations, itineraryItems, tripDays } from "@/lib/db/schema";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";
import {
  findDayEndStop,
  toDayEndPlaceFields,
} from "@/lib/trips/morning-base";
import { demoteOtherOvernightHotels } from "@/lib/trips/overnight-hotel";
import {
  syncNextDayMorningBaseInDb,
  syncPreviousDayEndFromMorningBaseInDb,
} from "@/lib/trips/sync-morning-base-db";

type Ctx = { params: Promise<{ tripId: string; itemId: string }> };

const patchSchema = z.object({
  status: z
    .enum(["to_visit", "visited", "skipped", "cancelled", "favorite"])
    .optional(),
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
  travelMode: z
    .enum(["driving", "walking", "bicycling", "transit"])
    .optional(),
  notes: z.string().max(4000).nullable().optional(),
  name: z.string().min(1).max(200).optional(),
  sortOrder: z.number().int().min(0).optional(),
  type: z.enum(["attraction", "hotel", "custom"]).optional(),
  googlePlaceId: z.string().max(256).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googleMapsUri: z.string().url().nullable().optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const { tripId, itemId } = await ctx.params;
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [item] = await db
    .select({
      id: itineraryItems.id,
      dayId: itineraryItems.dayId,
      type: itineraryItems.type,
      sortOrder: itineraryItems.sortOrder,
      name: itineraryItems.name,
      address: itineraryItems.address,
      latitude: itineraryItems.latitude,
      longitude: itineraryItems.longitude,
      googlePlaceId: itineraryItems.googlePlaceId,
      googleMapsUri: itineraryItems.googleMapsUri,
    })
    .from(itineraryItems)
    .innerJoin(tripDays, eq(tripDays.id, itineraryItems.dayId))
    .where(and(eq(itineraryItems.id, itemId), eq(tripDays.tripId, tripId)))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dayItemsBefore = await db
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
    })
    .from(itineraryItems)
    .where(eq(itineraryItems.dayId, item.dayId))
    .orderBy(asc(itineraryItems.sortOrder));

  const previousDayEndItem = findDayEndStop(dayItemsBefore);
  const previousDayEnd = previousDayEndItem
    ? toDayEndPlaceFields(previousDayEndItem)
    : null;

  const [updated] = await db
    .update(itineraryItems)
    .set(parsed.data)
    .where(eq(itineraryItems.id, itemId))
    .returning();

  const nextType = parsed.data.type ?? item.type;
  if (nextType === "hotel") {
    const dayItems = await db
      .select({
        id: itineraryItems.id,
        type: itineraryItems.type,
        sortOrder: itineraryItems.sortOrder,
      })
      .from(itineraryItems)
      .where(eq(itineraryItems.dayId, item.dayId))
      .orderBy(asc(itineraryItems.sortOrder));

    const demoted = demoteOtherOvernightHotels(dayItems, itemId);
    for (const row of demoted) {
      if (
        row.type !== "hotel" &&
        dayItems.some((d) => d.id === row.id && d.type === "hotel")
      ) {
        await db
          .update(itineraryItems)
          .set({ type: "attraction" })
          .where(
            and(eq(itineraryItems.id, row.id), ne(itineraryItems.id, itemId)),
          );
      }
    }

    const keepIndex = dayItems.findIndex((row) => row.id === itemId);
    if (keepIndex > 0) {
      await db
        .delete(accommodations)
        .where(eq(accommodations.dayId, item.dayId));
      await db.insert(accommodations).values({
        tripId,
        dayId: item.dayId,
        googlePlaceId: updated.googlePlaceId,
        name: updated.name,
        address: updated.address,
        latitude: updated.latitude,
        longitude: updated.longitude,
        googleMapsUri: updated.googleMapsUri,
        isConfirmed: "false",
      });
    }
  } else if (item.type === "hotel" && parsed.data.type && parsed.data.type !== "hotel") {
    const remainingHotels = await db
      .select({ id: itineraryItems.id, sortOrder: itineraryItems.sortOrder })
      .from(itineraryItems)
      .where(
        and(
          eq(itineraryItems.dayId, item.dayId),
          eq(itineraryItems.type, "hotel"),
        ),
      );
    const hasOvernight = remainingHotels.some((row) => row.sortOrder > 0);
    if (!hasOvernight) {
      await db
        .delete(accommodations)
        .where(eq(accommodations.dayId, item.dayId));
    }
  }

  const mayChangePlace =
    parsed.data.type != null ||
    parsed.data.name != null ||
    parsed.data.address !== undefined ||
    parsed.data.latitude !== undefined ||
    parsed.data.longitude !== undefined ||
    parsed.data.googlePlaceId !== undefined ||
    parsed.data.googleMapsUri !== undefined;

  const mayChangeDayEnd = mayChangePlace || parsed.data.status != null;

  if (mayChangePlace) {
    // Day N+1 morning base → Day N last stop
    await syncPreviousDayEndFromMorningBaseInDb({
      tripId,
      dayId: item.dayId,
      itemId,
    });
  }

  if (mayChangeDayEnd) {
    // Day N last stop → Day N+1 morning base
    await syncNextDayMorningBaseInDb({
      tripId,
      dayId: item.dayId,
      previousDayEnd,
    });
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { tripId, itemId } = await ctx.params;
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

  const [item] = await db
    .select({
      id: itineraryItems.id,
      dayId: itineraryItems.dayId,
      type: itineraryItems.type,
      sortOrder: itineraryItems.sortOrder,
      name: itineraryItems.name,
      address: itineraryItems.address,
      latitude: itineraryItems.latitude,
      longitude: itineraryItems.longitude,
      googlePlaceId: itineraryItems.googlePlaceId,
      googleMapsUri: itineraryItems.googleMapsUri,
    })
    .from(itineraryItems)
    .innerJoin(tripDays, eq(tripDays.id, itineraryItems.dayId))
    .where(and(eq(itineraryItems.id, itemId), eq(tripDays.tripId, tripId)))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dayItemsBefore = await db
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
    })
    .from(itineraryItems)
    .where(eq(itineraryItems.dayId, item.dayId))
    .orderBy(asc(itineraryItems.sortOrder));

  const previousDayEndItem = findDayEndStop(dayItemsBefore);
  const previousDayEnd = previousDayEndItem
    ? toDayEndPlaceFields(previousDayEndItem)
    : null;

  await db.delete(itineraryItems).where(eq(itineraryItems.id, itemId));

  if (item.type === "hotel" && item.sortOrder > 0) {
    await db.delete(accommodations).where(eq(accommodations.dayId, item.dayId));
  }

  await syncNextDayMorningBaseInDb({
    tripId,
    dayId: item.dayId,
    previousDayEnd,
  });

  return NextResponse.json({ ok: true });
}
