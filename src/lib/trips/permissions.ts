import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tripCollaborators, trips } from "@/lib/db/schema";

export type CollaboratorPermission = "VIEWER" | "EDITOR";

export type TripAccess = {
  trip: typeof trips.$inferSelect;
  isOwner: boolean;
  permission: CollaboratorPermission | null;
  isEditor: boolean;
  canView: boolean;
  canManageCollaborators: boolean;
  canDelete: boolean;
};

export async function getTripAccess(
  tripId: string,
  userId: string | null,
): Promise<TripAccess | null> {
  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);
  if (!trip) return null;

  const isOwner = !!userId && trip.ownerId === userId;
  let permission: CollaboratorPermission | null = null;

  if (userId && !isOwner) {
    const [collab] = await db
      .select()
      .from(tripCollaborators)
      .where(
        and(
          eq(tripCollaborators.tripId, tripId),
          eq(tripCollaborators.userId, userId),
        ),
      )
      .limit(1);
    permission = collab?.permission ?? null;
  }

  const isEditor = isOwner || permission === "EDITOR";
  const isCollaborator = isOwner || permission != null;
  const canView =
    isCollaborator ||
    trip.visibility === "public" ||
    trip.visibility === "unlisted";

  return {
    trip,
    isOwner,
    permission: isOwner ? "EDITOR" : permission,
    isEditor,
    canView,
    canManageCollaborators: isOwner,
    canDelete: isOwner,
  };
}

export function assertCanView(
  access: TripAccess | null,
): asserts access is TripAccess {
  if (!access?.canView) {
    throw new Error("Forbidden");
  }
}

export function assertCanEdit(
  access: TripAccess | null,
): asserts access is TripAccess {
  if (!access?.isEditor) {
    throw new Error("Forbidden");
  }
}

export function assertIsOwner(
  access: TripAccess | null,
): asserts access is TripAccess {
  if (!access?.isOwner) {
    throw new Error("Forbidden");
  }
}
