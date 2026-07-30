import { NextResponse } from "next/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { itineraryItems, tripDays } from "@/lib/db/schema";
import {
  findDayEndStop,
  toDayEndPlaceFields,
} from "@/lib/trips/morning-base";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";
import { syncNextDayMorningBaseInDb } from "@/lib/trips/sync-morning-base-db";

type Ctx = { params: Promise<{ tripId: string }> };

const schema = z.object({
  dayId: z.string().uuid(),
  orderedItemIds: z.array(z.string().uuid()).min(1).max(200),
});

/** Persist a day's stop order after drag-and-drop / move up-down. */
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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { dayId, orderedItemIds } = parsed.data;

  const [day] = await db
    .select({ id: tripDays.id })
    .from(tripDays)
    .where(and(eq(tripDays.id, dayId), eq(tripDays.tripId, tripId)))
    .limit(1);

  if (!day) {
    return NextResponse.json({ error: "Day not found" }, { status: 404 });
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
    .where(eq(itineraryItems.dayId, dayId))
    .orderBy(asc(itineraryItems.sortOrder));

  const previousDayEndItem = findDayEndStop(dayItemsBefore);
  const previousDayEnd = previousDayEndItem
    ? toDayEndPlaceFields(previousDayEndItem)
    : null;

  const existingIds = new Set(dayItemsBefore.map((i) => i.id));
  if (
    orderedItemIds.length !== existingIds.size ||
    orderedItemIds.some((id) => !existingIds.has(id))
  ) {
    return NextResponse.json(
      { error: "orderedItemIds must match the day's items exactly" },
      { status: 400 },
    );
  }

  await Promise.all(
    orderedItemIds.map((id, index) =>
      db
        .update(itineraryItems)
        .set({ sortOrder: index })
        .where(
          and(eq(itineraryItems.id, id), eq(itineraryItems.dayId, dayId)),
        ),
    ),
  );

  await syncNextDayMorningBaseInDb({
    tripId,
    dayId,
    previousDayEnd,
  });

  const items = await db
    .select()
    .from(itineraryItems)
    .where(inArray(itineraryItems.id, orderedItemIds));

  items.sort(
    (a, b) =>
      orderedItemIds.indexOf(a.id) - orderedItemIds.indexOf(b.id),
  );

  return NextResponse.json({ items });
}
