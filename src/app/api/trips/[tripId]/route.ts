import { NextResponse } from "next/server";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  accommodations,
  activityLogs,
  itineraryItems,
  tripCollaborators,
  tripDays,
  trips,
} from "@/lib/db/schema";
import {
  assertCanEdit,
  assertCanView,
  assertIsOwner,
  getTripAccess,
} from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { tripId } = await ctx.params;
  const session = await getSession();
  const access = await getTripAccess(tripId, session?.user.id ?? null);

  try {
    assertCanView(access);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const days = await db
    .select()
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
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
    .where(eq(accommodations.tripId, tripId));

  const collaborators = await db
    .select()
    .from(tripCollaborators)
    .where(eq(tripCollaborators.tripId, tripId));

  return NextResponse.json({
    trip: access.trip,
    access: {
      isOwner: access.isOwner,
      isEditor: access.isEditor,
      permission: access.permission,
    },
    days: days.map((d) => ({
      ...d,
      items: items.filter((i) => i.dayId === d.id),
    })),
    accommodations: lodging,
    collaborators,
  });
}

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
  slug: z.string().min(3).max(120).nullable().optional(),
  coverPhotoUrl: z.string().url().nullable().optional(),
  durationDays: z.number().int().positive().max(60).optional(),
  difficulty: z.enum(["easy", "moderate", "hard"]).optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;
  if (
    (data.visibility !== undefined || data.slug !== undefined) &&
    !access.isOwner
  ) {
    return NextResponse.json(
      { error: "Only the owner can change visibility or slug" },
      { status: 403 },
    );
  }

  const [updated] = await db
    .update(trips)
    .set({
      ...data,
      lastEditedBy: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(trips.id, tripId))
    .returning();

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: "trip.updated",
    metadata: data,
  });

  return NextResponse.json({ trip: updated });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { tripId } = await ctx.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getTripAccess(tripId, session.user.id);
  try {
    assertIsOwner(access);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(trips).where(eq(trips.id, tripId));
  return NextResponse.json({ ok: true });
}
