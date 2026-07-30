import { NextResponse } from "next/server";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { tripDays, trips } from "@/lib/db/schema";
import { assertCanEdit, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  date: z.string().nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
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
  const title = parsed.data.title?.trim() || `Day ${dayIndex}`;

  const [day] = await db
    .insert(tripDays)
    .values({
      tripId,
      dayIndex,
      title,
      date: parsed.data.date ?? null,
      notes: parsed.data.notes ?? null,
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

  return NextResponse.json({ day: { ...day, items: [] } }, { status: 201 });
}
