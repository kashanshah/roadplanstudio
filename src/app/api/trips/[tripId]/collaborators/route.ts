import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { activityLogs, profiles, tripCollaborators } from "@/lib/db/schema";
import { assertIsOwner, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

const inviteSchema = z.object({
  email: z.string().email().optional(),
  userId: z.string().min(1).optional(),
  permission: z.enum(["VIEWER", "EDITOR"]).default("VIEWER"),
});

async function resolveUserId(input: {
  email?: string;
  userId?: string;
}): Promise<string | null> {
  if (input.userId) return input.userId;
  if (!input.email) return null;
  const sql = neon(process.env.DATABASE_URL!);
  const users = await sql`
    SELECT id FROM "user" WHERE lower(email) = lower(${input.email}) LIMIT 1
  `;
  return (users[0] as { id: string } | undefined)?.id ?? null;
}

export async function GET(_request: Request, ctx: Ctx) {
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

  const collaborators = await db
    .select({
      id: tripCollaborators.id,
      userId: tripCollaborators.userId,
      permission: tripCollaborators.permission,
      joinedAt: tripCollaborators.joinedAt,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(tripCollaborators)
    .leftJoin(profiles, eq(profiles.userId, tripCollaborators.userId))
    .where(eq(tripCollaborators.tripId, tripId));

  let authUsers: Array<{ id: string; email: string; name: string | null }> = [];
  if (collaborators.length > 0 && process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const userIds = collaborators.map((c) => c.userId);
    authUsers = (await sql`
      SELECT id, email, name FROM "user" WHERE id = ANY(${userIds})
    `) as Array<{ id: string; email: string; name: string | null }>;
  }

  const ownerProfile = await db
    .select({
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.userId, access.trip.ownerId))
    .limit(1);

  let ownerAuth: { email: string; name: string | null } | null = null;
  if (process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT email, name FROM "user" WHERE id = ${access.trip.ownerId} LIMIT 1
    `;
    ownerAuth = (rows[0] as { email: string; name: string | null } | undefined) ?? null;
  }

  return NextResponse.json({
    owner: {
      userId: access.trip.ownerId,
      fullName: ownerProfile[0]?.fullName || ownerAuth?.name || null,
      email: ownerAuth?.email ?? null,
      avatarUrl: ownerProfile[0]?.avatarUrl ?? null,
      permission: "EDITOR" as const,
      isOwner: true,
    },
    collaborators: collaborators.map((c) => {
      const auth = authUsers.find((u) => u.id === c.userId);
      return {
        id: c.id,
        userId: c.userId,
        permission: c.permission,
        joinedAt: c.joinedAt,
        fullName: c.fullName || auth?.name || null,
        email: auth?.email ?? null,
        avatarUrl: c.avatarUrl,
        isOwner: false,
      };
    }),
  });
}

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
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success || (!parsed.data.email && !parsed.data.userId)) {
    return NextResponse.json(
      { error: "Provide email or userId" },
      { status: 400 },
    );
  }

  const targetUserId = await resolveUserId(parsed.data);
  if (!targetUserId) {
    return NextResponse.json(
      {
        error:
          "No registered user found for that email. Send an invite link instead.",
        code: "USER_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  if (targetUserId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot add yourself as a collaborator" },
      { status: 400 },
    );
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, targetUserId))
    .limit(1);
  if (!profile) {
    await db.insert(profiles).values({ userId: targetUserId });
  }

  const [existing] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, tripId),
        eq(tripCollaborators.userId, targetUserId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(tripCollaborators)
      .set({ permission: parsed.data.permission })
      .where(eq(tripCollaborators.id, existing.id));
  } else {
    await db.insert(tripCollaborators).values({
      tripId,
      userId: targetUserId,
      permission: parsed.data.permission,
    });
  }

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: "collaborator.added",
    metadata: { userId: targetUserId, permission: parsed.data.permission },
  });

  return NextResponse.json({ ok: true, userId: targetUserId }, { status: 201 });
}
