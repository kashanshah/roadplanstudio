import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { tripDays, trips } from "@/lib/db/schema";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string; dayId: string }> };

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.string().nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  routeSummary: z.string().max(500).nullable().optional(),
  isRestDay: z.boolean().optional(),
});

async function requireEditableDay(tripId: string, dayId: string, userId: string) {
  const access = await getTripAccess(tripId, userId);
  assertCanEdit(access);

  const [day] = await db
    .select()
    .from(tripDays)
    .where(and(eq(tripDays.id, dayId), eq(tripDays.tripId, tripId)))
    .limit(1);

  return day ?? null;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { tripId, dayId } = await ctx.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let day;
  try {
    day = await requireEditableDay(tripId, dayId, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!day) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const patch = parsed.data;
  const [updated] = await db
    .update(tripDays)
    .set({
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.date !== undefined ? { date: patch.date } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.routeSummary !== undefined
        ? { routeSummary: patch.routeSummary }
        : {}),
      ...(patch.isRestDay !== undefined
        ? { isRestDay: patch.isRestDay ? "true" : "false" }
        : {}),
    })
    .where(eq(tripDays.id, dayId))
    .returning();

  await db
    .update(trips)
    .set({
      lastEditedBy: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(trips.id, tripId));

  return NextResponse.json({
    day: {
      ...updated,
      isRestDay: updated.isRestDay === "true",
    },
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { tripId, dayId } = await ctx.params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let day;
  try {
    day = await requireEditableDay(tripId, dayId, session.user.id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!day) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const existing = await db
    .select({ id: tripDays.id })
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId));

  if (existing.length <= 1) {
    return NextResponse.json(
      { error: "A trip needs at least one day" },
      { status: 400 },
    );
  }

  await db.delete(tripDays).where(eq(tripDays.id, dayId));

  const remaining = await db
    .select()
    .from(tripDays)
    .where(eq(tripDays.tripId, tripId))
    .orderBy(asc(tripDays.dayIndex));

  for (let i = 0; i < remaining.length; i++) {
    const nextIndex = i + 1;
    if (remaining[i].dayIndex !== nextIndex) {
      await db
        .update(tripDays)
        .set({ dayIndex: nextIndex })
        .where(eq(tripDays.id, remaining[i].id));
    }
  }

  await db
    .update(trips)
    .set({
      durationDays: remaining.length,
      lastEditedBy: session.user.id,
      updatedAt: new Date(),
    })
    .where(eq(trips.id, tripId));

  return NextResponse.json({
    ok: true,
    days: remaining.map((d, i) => ({
      ...d,
      dayIndex: i + 1,
    })),
  });
}
