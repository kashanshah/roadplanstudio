import { NextResponse } from "next/server";
import { and, asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { itineraryItems, tripDays, trips } from "@/lib/db/schema";
import {
  findDayEndStop,
  toDayEndPlaceFields,
} from "@/lib/trips/morning-base";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";
import { syncNextDayMorningBaseInDb } from "@/lib/trips/sync-morning-base-db";

type Ctx = { params: Promise<{ tripId: string }> };

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.string().nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  isRestDay: z.boolean().optional(),
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
  const parsed = createSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [agg] = await db
    .select({ maxIndex: max(tripDays.dayIndex) })
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId));

  const dayIndex = (agg?.maxIndex ?? 0) + 1;
  const isRest = parsed.data.isRestDay === true;
  const title =
    parsed.data.title?.trim() ||
    (isRest ? `Rest day` : `Day ${dayIndex}`);

  const [day] = await db
    .insert(tripDays)
    .values({
      tripId,
      dayIndex,
      title,
      date: parsed.data.date ?? null,
      notes: parsed.data.notes ?? null,
      isRestDay: isRest ? "true" : "false",
    })
    .returning();

  await db
    .update(trips)
    .set({
      durationDays: dayIndex,
      lastEditedBy: session.user.id,
      updatedAt: new Date(),
    })
    .where(and(eq(trips.id, tripId)));

  // Seed morning base from the previous day's last active stop.
  if (dayIndex > 1) {
    const [prevDay] = await db
      .select({ id: tripDays.id })
      .from(tripDays)
      .where(
        and(eq(tripDays.tripId, tripId), eq(tripDays.dayIndex, dayIndex - 1)),
      )
      .limit(1);

    if (prevDay) {
      const prevItems = await db
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
        .where(eq(itineraryItems.dayId, prevDay.id))
        .orderBy(asc(itineraryItems.sortOrder));

      const end = findDayEndStop(prevItems);
      await syncNextDayMorningBaseInDb({
        tripId,
        dayId: prevDay.id,
        previousDayEnd: end ? toDayEndPlaceFields(end) : null,
      });
    }
  }

  const items = await db
    .select()
    .from(itineraryItems)
    .where(eq(itineraryItems.dayId, day.id))
    .orderBy(asc(itineraryItems.sortOrder));

  return NextResponse.json({
    day: {
      ...day,
      isRestDay: day.isRestDay === "true",
      items,
    },
  }, { status: 201 });
}
