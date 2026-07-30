import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  activityLogs,
  profiles,
  tripCollaborators,
  tripInvites,
} from "@/lib/db/schema";
import { ensureProfile } from "@/lib/trips/ensure-profile";

const schema = z.object({
  token: z.string().min(10),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const [invite] = await db
    .select()
    .from(tripInvites)
    .where(
      and(
        eq(tripInvites.token, parsed.data.token),
        isNull(tripInvites.acceptedAt),
      ),
    )
    .limit(1);

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 410 });
  }

  if (
    session.user.email &&
    session.user.email.toLowerCase() !== invite.email.toLowerCase()
  ) {
    return NextResponse.json(
      { error: "Sign in with the invited email address" },
      { status: 403 },
    );
  }

  await ensureProfile(session.user);

  const [existing] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, invite.tripId),
        eq(tripCollaborators.userId, session.user.id),
      ),
    )
    .limit(1);

  if (!existing) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);
    if (!profile) {
      await db.insert(profiles).values({ userId: session.user.id });
    }
    await db.insert(tripCollaborators).values({
      tripId: invite.tripId,
      userId: session.user.id,
      permission: invite.permission,
    });
  }

  await db
    .update(tripInvites)
    .set({ acceptedAt: new Date() })
    .where(eq(tripInvites.id, invite.id));

  await db.insert(activityLogs).values({
    tripId: invite.tripId,
    userId: session.user.id,
    action: "invite.accepted",
    metadata: { inviteId: invite.id },
  });

  return NextResponse.json({ tripId: invite.tripId });
}
