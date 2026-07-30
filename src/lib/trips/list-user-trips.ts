import { and, desc, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { tripCollaborators, trips } from "@/lib/db/schema";

export type UserTripSummary = {
  id: string;
  title: string;
  description: string | null;
  coverPhotoUrl: string | null;
  durationDays: number;
  totalDistanceKm: number | null;
  difficulty: string;
  visibility: string;
  updatedAt: Date;
  createdAt: Date;
  role: "owner" | "EDITOR" | "VIEWER";
};

export async function listUserTrips(userId: string): Promise<UserTripSummary[]> {
  const owned = await db
    .select({
      id: trips.id,
      title: trips.title,
      description: trips.description,
      coverPhotoUrl: trips.coverPhotoUrl,
      durationDays: trips.durationDays,
      totalDistanceKm: trips.totalDistanceKm,
      difficulty: trips.difficulty,
      visibility: trips.visibility,
      updatedAt: trips.updatedAt,
      createdAt: trips.createdAt,
    })
    .from(trips)
    .where(eq(trips.ownerId, userId))
    .orderBy(desc(trips.updatedAt));

  const shared = await db
    .select({
      id: trips.id,
      title: trips.title,
      description: trips.description,
      coverPhotoUrl: trips.coverPhotoUrl,
      durationDays: trips.durationDays,
      totalDistanceKm: trips.totalDistanceKm,
      difficulty: trips.difficulty,
      visibility: trips.visibility,
      updatedAt: trips.updatedAt,
      createdAt: trips.createdAt,
      permission: tripCollaborators.permission,
    })
    .from(tripCollaborators)
    .innerJoin(trips, eq(trips.id, tripCollaborators.tripId))
    .where(
      and(eq(tripCollaborators.userId, userId), ne(trips.ownerId, userId)),
    )
    .orderBy(desc(trips.updatedAt));

  const ownedRows: UserTripSummary[] = owned.map((t) => ({
    ...t,
    role: "owner" as const,
  }));

  const sharedRows: UserTripSummary[] = shared.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    coverPhotoUrl: t.coverPhotoUrl,
    durationDays: t.durationDays,
    totalDistanceKm: t.totalDistanceKm,
    difficulty: t.difficulty,
    visibility: t.visibility,
    updatedAt: t.updatedAt,
    createdAt: t.createdAt,
    role: t.permission,
  }));

  return [...ownedRows, ...sharedRows].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
}
