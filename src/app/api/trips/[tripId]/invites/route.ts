import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { renderTripInviteEmail } from "@/emails/templates";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { activityLogs, tripInvites } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email/resend";
import { assertIsOwner, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

const schema = z.object({
  email: z.string().email(),
  permission: z.enum(["VIEWER", "EDITOR"]).default("VIEWER"),
});

export async function POST(request: Request, ctx: Ctx) {
  const { tripId } = await ctx.params;
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

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const inviteEmail = parsed.data.email.toLowerCase();

  const [invite] = await db
    .insert(tripInvites)
    .values({
      tripId,
      email: inviteEmail,
      permission: parsed.data.permission,
      token,
      expiresAt,
    })
    .onConflictDoNothing()
    .returning();

  let result = invite;
  if (!result) {
    const [updated] = await db
      .update(tripInvites)
      .set({
        permission: parsed.data.permission,
        token,
        expiresAt,
        acceptedAt: null,
      })
      .where(
        and(eq(tripInvites.tripId, tripId), eq(tripInvites.email, inviteEmail)),
      )
      .returning();
    result = updated;
  }

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: "invite.created",
    metadata: { email: inviteEmail, permission: parsed.data.permission },
  });

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  const acceptUrl = `${base}/auth/accept-invite?token=${token}`;

  const email = renderTripInviteEmail({
    tripTitle: access.trip.title,
    acceptUrl,
    permission: parsed.data.permission,
    durationDays: access.trip.durationDays,
    routeSummary: access.trip.description,
  });

  try {
    await sendEmail({
      to: inviteEmail,
      subject: email.subject,
      html: email.html,
    });
  } catch (err) {
    console.error("Failed to send invite email", err);
    return NextResponse.json(
      {
        invite: result,
        acceptUrl,
        warning: "Invite saved but email failed to send",
      },
      { status: 201 },
    );
  }

  return NextResponse.json({
    invite: result,
    acceptUrl,
  });
}
