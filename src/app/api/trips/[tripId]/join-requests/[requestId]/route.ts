import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { activityLogs, tripJoinRequests } from "@/lib/db/schema";
import { ensureCollaborator } from "@/lib/trips/invite-links";
import { assertIsOwner, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string; requestId: string }> };

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(request: Request, ctx: Ctx) {
  const { tripId, requestId } = await ctx.params;
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

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const [joinRequest] = await db
    .select()
    .from(tripJoinRequests)
    .where(
      and(
        eq(tripJoinRequests.id, requestId),
        eq(tripJoinRequests.tripId, tripId),
      ),
    )
    .limit(1);

  if (!joinRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (joinRequest.status !== "pending") {
    return NextResponse.json(
      { error: "Request already resolved", status: joinRequest.status },
      { status: 409 },
    );
  }

  if (parsed.data.action === "approve") {
    await ensureCollaborator({
      tripId,
      userId: joinRequest.userId,
      permission: joinRequest.permission,
      actorUserId: session.user.id,
      activityAction: "join_request.approved",
      activityMetadata: {
        requestId: joinRequest.id,
        userId: joinRequest.userId,
        permission: joinRequest.permission,
      },
    });

    await db
      .update(tripJoinRequests)
      .set({
        status: "approved",
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
      })
      .where(eq(tripJoinRequests.id, joinRequest.id));

    return NextResponse.json({ ok: true, status: "approved" });
  }

  await db
    .update(tripJoinRequests)
    .set({
      status: "rejected",
      resolvedAt: new Date(),
      resolvedBy: session.user.id,
    })
    .where(eq(tripJoinRequests.id, joinRequest.id));

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: "join_request.rejected",
    metadata: {
      requestId: joinRequest.id,
      userId: joinRequest.userId,
    },
  });

  return NextResponse.json({ ok: true, status: "rejected" });
}
