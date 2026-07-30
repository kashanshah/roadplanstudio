import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { itineraryItems, tripDays } from "@/lib/db/schema";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string; itemId: string }> };

const patchSchema = z.object({
  status: z
    .enum(["to_visit", "visited", "skipped", "cancelled", "favorite"])
    .optional(),
  durationMins: z.number().int().min(0).max(24 * 60).nullable().optional(),
  travelMode: z
    .enum(["driving", "walking", "bicycling", "transit"])
    .optional(),
  notes: z.string().max(4000).nullable().optional(),
  name: z.string().min(1).max(200).optional(),
  sortOrder: z.number().int().min(0).optional(),
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
    })
    .from(itineraryItems)
    .innerJoin(tripDays, eq(tripDays.id, itineraryItems.dayId))
    .where(and(eq(itineraryItems.id, itemId), eq(tripDays.tripId, tripId)))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(itineraryItems)
    .set(parsed.data)
    .where(eq(itineraryItems.id, itemId))
    .returning();

  return NextResponse.json({ item: updated });
}
