import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { packingItems } from "@/lib/db/schema";
import { createDefaultPackingItems } from "@/lib/packing/defaults";
import {
  assertCanEdit,
  assertCanView,
  getTripAccess,
} from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

function serialize(row: typeof packingItems.$inferSelect) {
  return {
    id: row.id,
    label: row.label,
    packed: row.packed === "true",
    sortOrder: row.sortOrder,
    category: null as string | null,
  };
}

export async function GET(_request: Request, ctx: Ctx) {
  const { tripId } = await ctx.params;
  const session = await getSession();
  const access = await getTripAccess(tripId, session?.user.id ?? null);

  try {
    assertCanView(access);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(packingItems)
    .where(eq(packingItems.tripId, tripId))
    .orderBy(asc(packingItems.sortOrder));

  return NextResponse.json({ items: rows.map(serialize) });
}

const createSchema = z.object({
  label: z.string().trim().min(1).max(200).optional(),
  packed: z.boolean().optional().default(false),
  sortOrder: z.number().int().nonnegative().optional(),
  seedDefaults: z.boolean().optional(),
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

  if (parsed.data.seedDefaults) {
    const existing = await db
      .select()
      .from(packingItems)
      .where(eq(packingItems.tripId, tripId))
      .limit(1);
    if (existing.length === 0) {
      const seeded = createDefaultPackingItems((item) => ({
        tripId,
        label: item.label,
        packed: "false",
        sortOrder: item.sortOrder,
      }));
      const inserted = await db.insert(packingItems).values(seeded).returning();
      return NextResponse.json({ items: inserted.map(serialize) });
    }
    const rows = await db
      .select()
      .from(packingItems)
      .where(eq(packingItems.tripId, tripId))
      .orderBy(asc(packingItems.sortOrder));
    return NextResponse.json({ items: rows.map(serialize) });
  }

  if (!parsed.data.label) {
    return NextResponse.json({ error: "Label required" }, { status: 400 });
  }

  const maxOrder = await db
    .select()
    .from(packingItems)
    .where(eq(packingItems.tripId, tripId))
    .orderBy(asc(packingItems.sortOrder));
  const sortOrder =
    parsed.data.sortOrder ??
    (maxOrder.length ? maxOrder[maxOrder.length - 1]!.sortOrder + 1 : 0);

  const [row] = await db
    .insert(packingItems)
    .values({
      tripId,
      label: parsed.data.label,
      packed: parsed.data.packed ? "true" : "false",
      sortOrder,
    })
    .returning();

  return NextResponse.json({ item: serialize(row) }, { status: 201 });
}
