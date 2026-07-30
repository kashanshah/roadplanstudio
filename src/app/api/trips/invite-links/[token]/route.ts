import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  tripCollaborators,
  tripInviteLinks,
  tripJoinRequests,
  trips,
} from "@/lib/db/schema";

type Ctx = { params: Promise<{ token: string }> };

/**
 * Public preview of a shareable invite link.
 * Trip detail depth follows visibility: private trips expose title only
 * (accept/decline), never itinerary contents.
 */
export async function GET(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
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
    .select({
      id: trips.id,
      ownerId: trips.ownerId,
      title: trips.title,
      description: trips.description,
      durationDays: trips.durationDays,
      coverPhotoUrl: trips.coverPhotoUrl,
      visibility: trips.visibility,
      slug: trips.slug,
      difficulty: trips.difficulty,
    })
    .from(trips)
    .where(eq(trips.id, link.tripId))
    .limit(1);

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const isPrivate = trip.visibility === "private";
  const canPreviewTrip = !isPrivate;

  const session = await getSession();
  let membership: {
    isOwner: boolean;
    isCollaborator: boolean;
    permission: "VIEWER" | "EDITOR" | null;
    pendingRequest: boolean;
  } | null = null;

  if (session?.user.id) {
    const isOwner = trip.ownerId === session.user.id;

    const [collab] = await db
      .select()
      .from(tripCollaborators)
      .where(
        and(
          eq(tripCollaborators.tripId, trip.id),
          eq(tripCollaborators.userId, session.user.id),
        ),
      )
      .limit(1);

    const [pending] = await db
      .select()
      .from(tripJoinRequests)
      .where(
        and(
          eq(tripJoinRequests.tripId, trip.id),
          eq(tripJoinRequests.userId, session.user.id),
          eq(tripJoinRequests.status, "pending"),
        ),
      )
      .limit(1);

    membership = {
      isOwner,
      isCollaborator: !!collab,
      permission: collab?.permission ?? (isOwner ? "EDITOR" : null),
      pendingRequest: !!pending,
    };
  }

  return NextResponse.json({
    link: {
      permission: link.permission,
      requireApproval: link.requireApproval === "true",
    },
    trip: {
      id: trip.id,
      title: trip.title,
      visibility: trip.visibility,
      ...(canPreviewTrip
        ? {
            description: trip.description,
            durationDays: trip.durationDays,
            coverPhotoUrl: trip.coverPhotoUrl,
            slug: trip.slug,
            difficulty: trip.difficulty,
          }
        : {}),
    },
    canViewItinerary: canPreviewTrip,
    membership,
  });
}
