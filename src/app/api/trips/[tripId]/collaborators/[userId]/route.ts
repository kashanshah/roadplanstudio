import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { activityLogs, tripCollaborators, tripJoinRequests } from "@/lib/db/schema";
import { assertIsOwner, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string; userId: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const { tripId, userId } = await ctx.params;
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

  if (userId === access.trip.ownerId) {
    return NextResponse.json(
      { error: "Cannot remove the trip owner" },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, tripId),
        eq(tripCollaborators.userId, userId),
      ),
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: "Collaborator not found" },
      { status: 404 },
    );
  }

  await db
    .delete(tripCollaborators)
    .where(eq(tripCollaborators.id, existing.id));

  await db
    .delete(tripJoinRequests)
    .where(
      and(
        eq(tripJoinRequests.tripId, tripId),
        eq(tripJoinRequests.userId, userId),
      ),
    );

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: "collaborator.removed",
    metadata: { userId, permission: existing.permission },
  });

  return NextResponse.json({ ok: true });
}
