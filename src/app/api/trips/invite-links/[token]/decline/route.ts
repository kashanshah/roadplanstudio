import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  activityLogs,
  tripInviteLinks,
  tripJoinRequests,
} from "@/lib/db/schema";

type Ctx = { params: Promise<{ token: string }> };

/** Decline a shareable invite / cancel a pending join request. */
export async function POST(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [link] = await db
    .select()
    .from(tripInviteLinks)
    .where(eq(tripInviteLinks.token, token))
    .limit(1);

  if (!link) {
    return NextResponse.json({ error: "Invite link not found" }, { status: 404 });
  }

  const [pending] = await db
    .select()
    .from(tripJoinRequests)
    .where(
      and(
        eq(tripJoinRequests.tripId, link.tripId),
        eq(tripJoinRequests.userId, session.user.id),
        eq(tripJoinRequests.status, "pending"),
      ),
    )
    .limit(1);

  if (pending) {
    await db
      .update(tripJoinRequests)
      .set({
        status: "rejected",
        resolvedAt: new Date(),
        resolvedBy: session.user.id,
      })
      .where(eq(tripJoinRequests.id, pending.id));

    await db.insert(activityLogs).values({
      tripId: link.tripId,
      userId: session.user.id,
      action: "join_request.declined",
      metadata: { requestId: pending.id },
    });
  } else {
    await db.insert(activityLogs).values({
      tripId: link.tripId,
      userId: session.user.id,
      action: "invite_link.declined",
      metadata: { inviteLinkId: link.id },
    });
  }

  return NextResponse.json({ ok: true, status: "declined" });
}