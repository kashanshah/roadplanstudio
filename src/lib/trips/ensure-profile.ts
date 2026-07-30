import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

/** Ensure a profiles row exists for a Better Auth user. */
export async function ensureProfile(user: {
  id: string;
  name?: string | null;
  image?: string | null;
}) {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(profiles)
    .values({
      userId: user.id,
      fullName: user.name ?? null,
      avatarUrl: user.image ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (created) return created;

  const [again] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  return again!;
}
