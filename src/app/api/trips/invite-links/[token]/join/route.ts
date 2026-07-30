import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  activityLogs,
  tripCollaborators,
  tripInviteLinks,
  trips,
} from "@/lib/db/schema";
import { ensureProfile } from "@/lib/trips/ensure-profile";
import {
  ensureCollaborator,
  upsertJoinRequest,
} from "@/lib/trips/invite-links";

type Ctx = { params: Promise<{ token: string }> };

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

  if (link.enabled !== "true") {
    return NextResponse.json(
      { error: "This invite link is disabled", code: "LINK_DISABLED" },
      { status: 410 },
    );
  }

  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, link.tripId))
    .limit(1);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  if (trip.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "You already own this trip", tripId: trip.id, status: "owner" },
      { status: 200 },
    );
  }

  await ensureProfile(session.user);

  const [existingCollab] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, trip.id),
        eq(tripCollaborators.userId, session.user.id),
      ),
    )
    .limit(1);

  if (existingCollab) {
    return NextResponse.json({
      tripId: trip.id,
      status: "already_member",
      permission: existingCollab.permission,
    });
  }

  if (link.requireApproval === "true") {
    const result = await upsertJoinRequest({
      tripId: trip.id,
      inviteLinkId: link.id,
      userId: session.user.id,
      permission: link.permission,
    });

    if ("alreadyApproved" in result && result.alreadyApproved) {
      await ensureCollaborator({
        tripId: trip.id,
        userId: session.user.id,
        permission: link.permission,
        actorUserId: session.user.id,
        activityAction: "invite_link.joined",
      });
      return NextResponse.json({
        tripId: trip.id,
        status: "joined",
        permission: link.permission,
      });
    }

    if (result.created) {
      await db.insert(activityLogs).values({
        tripId: trip.id,
        userId: session.user.id,
        action: "join_request.created",
        metadata: {
          inviteLinkId: link.id,
          permission: link.permission,
        },
      });
    }

    return NextResponse.json({
      tripId: trip.id,
      status: "pending",
      permission: link.permission,
      requestId: result.request.id,
    });
  }

  await ensureCollaborator({
    tripId: trip.id,
    userId: session.user.id,
    permission: link.permission,
    actorUserId: session.user.id,
    activityAction: "invite_link.joined",
    activityMetadata: {
      inviteLinkId: link.id,
      permission: link.permission,
    },
  });

  return NextResponse.json({
    tripId: trip.id,
    status: "joined",
    permission: link.permission,
  });
}
