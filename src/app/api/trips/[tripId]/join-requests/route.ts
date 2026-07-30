import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { and, desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { profiles, tripJoinRequests } from "@/lib/db/schema";
import { assertIsOwner, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

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

  const requests = await db
    .select({
      id: tripJoinRequests.id,
      tripId: tripJoinRequests.tripId,
      userId: tripJoinRequests.userId,
      permission: tripJoinRequests.permission,
      status: tripJoinRequests.status,
      createdAt: tripJoinRequests.createdAt,
      fullName: profiles.fullName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(tripJoinRequests)
    .leftJoin(profiles, eq(profiles.userId, tripJoinRequests.userId))
    .where(
      and(
        eq(tripJoinRequests.tripId, tripId),
        eq(tripJoinRequests.status, "pending"),
      ),
    )
    .orderBy(desc(tripJoinRequests.createdAt));

  const authById = new Map<
    string,
    { email: string; name: string | null }
  >();

  if (requests.length > 0 && process.env.DATABASE_URL) {
    const sql = neon(process.env.DATABASE_URL);
    const userIds = requests.map((r) => r.userId);
    const rows = (await sql`
      SELECT id, email, name FROM "user" WHERE id = ANY(${userIds})
    `) as Array<{ id: string; email: string; name: string | null }>;
    for (const row of rows) {
      authById.set(row.id, { email: row.email, name: row.name });
    }
  }

  return NextResponse.json({
    requests: requests.map((r) => {
      const auth = authById.get(r.userId);
      return {
        id: r.id,
        tripId: r.tripId,
        userId: r.userId,
        permission: r.permission,
        status: r.status,
        createdAt: r.createdAt,
        email: auth?.email ?? null,
        fullName: r.fullName || auth?.name || null,
        avatarUrl: r.avatarUrl,
      };
    }),
  });
}
