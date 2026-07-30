import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { tripInvites, trips } from "@/lib/db/schema";

type Ctx = { params: Promise<{ token: string }> };

/** Public preview of an invite (no auth) — enough to render the accept page. */
export async function GET(_request: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  if (!token || token.length < 10) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const [invite] = await db
    .select()
    .from(tripInvites)
    .where(and(eq(tripInvites.token, token), isNull(tripInvites.acceptedAt)))
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  const [trip] = await db
    .select({
      id: trips.id,
      title: trips.title,
      description: trips.description,
      durationDays: trips.durationDays,
      coverPhotoUrl: trips.coverPhotoUrl,
    })
    .from(trips)
    .where(eq(trips.id, invite.tripId))
    .limit(1);

  return NextResponse.json({
    invite: {
      email: invite.email,
      permission: invite.permission,
      expiresAt: invite.expiresAt,
    },
    trip,
  });
}
