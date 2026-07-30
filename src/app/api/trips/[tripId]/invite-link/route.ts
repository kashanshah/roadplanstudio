import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { activityLogs, tripInviteLinks } from "@/lib/db/schema";
import {
  getInviteLinkForTrip,
  serializeInviteLink,
} from "@/lib/trips/invite-links";
import { assertIsOwner, getTripAccess } from "@/lib/trips/permissions";

type Ctx = { params: Promise<{ tripId: string }> };

const createSchema = z.object({
  permission: z.enum(["VIEWER", "EDITOR"]).default("VIEWER"),
  requireApproval: z.boolean().default(false),
  /** When true, mint a new token even if a link already exists. */
  regenerate: z.boolean().default(false),
});

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  requireApproval: z.boolean().optional(),
  permission: z.enum(["VIEWER", "EDITOR"]).optional(),
  regenerate: z.boolean().optional(),
});

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

  const link = await getInviteLinkForTrip(tripId);
  return NextResponse.json({
    link: link ? serializeInviteLink(link) : null,
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

  const body = await request.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await getInviteLinkForTrip(tripId);
  const token = randomBytes(24).toString("hex");

  if (existing && !parsed.data.regenerate) {
    const [updated] = await db
      .update(tripInviteLinks)
      .set({
        permission: parsed.data.permission,
        requireApproval: parsed.data.requireApproval ? "true" : "false",
        enabled: "true",
        updatedAt: new Date(),
      })
      .where(eq(tripInviteLinks.id, existing.id))
      .returning();

    await db.insert(activityLogs).values({
      tripId,
      userId: session.user.id,
      action: "invite_link.updated",
      metadata: {
        permission: parsed.data.permission,
        requireApproval: parsed.data.requireApproval,
      },
    });

    return NextResponse.json({ link: serializeInviteLink(updated) });
  }

  if (existing && parsed.data.regenerate) {
    const [updated] = await db
      .update(tripInviteLinks)
      .set({
        token,
        permission: parsed.data.permission,
        requireApproval: parsed.data.requireApproval ? "true" : "false",
        enabled: "true",
        updatedAt: new Date(),
      })
      .where(eq(tripInviteLinks.id, existing.id))
      .returning();

    await db.insert(activityLogs).values({
      tripId,
      userId: session.user.id,
      action: "invite_link.regenerated",
      metadata: {
        permission: parsed.data.permission,
        requireApproval: parsed.data.requireApproval,
      },
    });

    return NextResponse.json({ link: serializeInviteLink(updated) });
  }

  const [created] = await db
    .insert(tripInviteLinks)
    .values({
      tripId,
      token,
      permission: parsed.data.permission,
      requireApproval: parsed.data.requireApproval ? "true" : "false",
      enabled: "true",
      createdBy: session.user.id,
    })
    .returning();

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: "invite_link.created",
    metadata: {
      permission: parsed.data.permission,
      requireApproval: parsed.data.requireApproval,
    },
  });

  return NextResponse.json(
    { link: serializeInviteLink(created) },
    { status: 201 },
  );
}

export async function PATCH(request: Request, ctx: Ctx) {
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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await getInviteLinkForTrip(tripId);
  if (!existing) {
    return NextResponse.json({ error: "Invite link not found" }, { status: 404 });
  }

  const patch: Partial<typeof tripInviteLinks.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (parsed.data.enabled !== undefined) {
    patch.enabled = parsed.data.enabled ? "true" : "false";
  }
  if (parsed.data.requireApproval !== undefined) {
    patch.requireApproval = parsed.data.requireApproval ? "true" : "false";
  }
  if (parsed.data.permission !== undefined) {
    patch.permission = parsed.data.permission;
  }
  if (parsed.data.regenerate) {
    patch.token = randomBytes(24).toString("hex");
  }

  const [updated] = await db
    .update(tripInviteLinks)
    .set(patch)
    .where(eq(tripInviteLinks.id, existing.id))
    .returning();

  await db.insert(activityLogs).values({
    tripId,
    userId: session.user.id,
    action: parsed.data.regenerate
      ? "invite_link.regenerated"
      : "invite_link.updated",
    metadata: {
      enabled: updated.enabled === "true",
      requireApproval: updated.requireApproval === "true",
      permission: updated.permission,
    },
  });

  return NextResponse.json({ link: serializeInviteLink(updated) });
}
