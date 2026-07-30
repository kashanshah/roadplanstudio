import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { packingItems } from "@/lib/db/schema";
import {
  assertCanEdit,
  getTripAccess,
} from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string; itemId: string }> };

function serialize(row: typeof packingItems.$inferSelect) {
  return {
    id: row.id,
    label: row.label,
    packed: row.packed === "true",
    sortOrder: row.sortOrder,
    category: null as string | null,
  };
}

const patchSchema = z.object({
  label: z.string().trim().min(1).max(200).optional(),
  packed: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
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

  const patch: Partial<typeof packingItems.$inferInsert> = {};
  if (parsed.data.label != null) patch.label = parsed.data.label;
  if (parsed.data.packed != null) {
    patch.packed = parsed.data.packed ? "true" : "false";
  }
  if (parsed.data.sortOrder != null) patch.sortOrder = parsed.data.sortOrder;

  const [row] = await db
    .update(packingItems)
    .set(patch)
    .where(and(eq(packingItems.id, itemId), eq(packingItems.tripId, tripId)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item: serialize(row) });
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

  const deleted = await db
    .delete(packingItems)
    .where(and(eq(packingItems.id, itemId), eq(packingItems.tripId, tripId)))
    .returning();

  if (!deleted.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
