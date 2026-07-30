import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activityLogs,
  profiles,
  tripCollaborators,
  tripInviteLinks,
  tripJoinRequests,
} from "@/lib/db/schema";
import type { CollaboratorPermission } from "@/lib/trips/permissions";

export function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  );
}

export function inviteLinkUrl(token: string) {
  return `${siteBaseUrl()}/invite/${token}`;
}

export function serializeInviteLink(
  link: typeof tripInviteLinks.$inferSelect,
) {
  return {
    id: link.id,
    tripId: link.tripId,
    token: link.token,
    permission: link.permission as CollaboratorPermission,
    enabled: link.enabled === "true",
    requireApproval: link.requireApproval === "true",
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
    url: inviteLinkUrl(link.token),
  };
}

export async function getInviteLinkForTrip(tripId: string) {
  const [link] = await db
    .select()
    .from(tripInviteLinks)
    .where(eq(tripInviteLinks.tripId, tripId))
    .limit(1);
  return link ?? null;
}

export async function ensureCollaborator(input: {
  tripId: string;
  userId: string;
  permission: CollaboratorPermission;
  actorUserId?: string | null;
  activityAction?: string;
  activityMetadata?: Record<string, unknown>;
}) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, input.userId))
    .limit(1);
  if (!profile) {
    await db.insert(profiles).values({ userId: input.userId });
  }

  const [existing] = await db
    .select()
    .from(tripCollaborators)
    .where(
      and(
        eq(tripCollaborators.tripId, input.tripId),
        eq(tripCollaborators.userId, input.userId),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.permission !== input.permission) {
      await db
        .update(tripCollaborators)
        .set({ permission: input.permission })
        .where(eq(tripCollaborators.id, existing.id));
    }
  } else {
    await db.insert(tripCollaborators).values({
      tripId: input.tripId,
      userId: input.userId,
      permission: input.permission,
    });
  }

  if (input.activityAction) {
    await db.insert(activityLogs).values({
      tripId: input.tripId,
      userId: input.actorUserId ?? input.userId,
      action: input.activityAction,
      metadata: input.activityMetadata ?? {
        userId: input.userId,
        permission: input.permission,
      },
    });
  }
}

export async function upsertJoinRequest(input: {
  tripId: string;
  inviteLinkId: string;
  userId: string;
  permission: CollaboratorPermission;
}) {
  const [existing] = await db
    .select()
    .from(tripJoinRequests)
    .where(
      and(
        eq(tripJoinRequests.tripId, input.tripId),
        eq(tripJoinRequests.userId, input.userId),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.status === "pending") {
      return { request: existing, created: false as const };
    }
    if (existing.status === "approved") {
      return { request: existing, created: false as const, alreadyApproved: true as const };
    }
    const [updated] = await db
      .update(tripJoinRequests)
      .set({
        inviteLinkId: input.inviteLinkId,
        permission: input.permission,
        status: "pending",
        resolvedAt: null,
        resolvedBy: null,
        createdAt: new Date(),
      })
      .where(eq(tripJoinRequests.id, existing.id))
      .returning();
    return { request: updated, created: true as const };
  }

  const [created] = await db
    .insert(tripJoinRequests)
    .values({
      tripId: input.tripId,
      inviteLinkId: input.inviteLinkId,
      userId: input.userId,
      permission: input.permission,
      status: "pending",
    })
    .returning();

  return { request: created, created: true as const };
}
