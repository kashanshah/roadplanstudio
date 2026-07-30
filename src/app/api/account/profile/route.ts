import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { ensureProfile } from "@/lib/trips/ensure-profile";

const schema = z.object({
  fullName: z.string().max(120).optional(),
  phone: z.string().max(40).nullable().optional(),
  language: z.string().max(10).optional(),
  distanceUnit: z.enum(["km", "mi"]).optional(),
  temperatureUnit: z.enum(["c", "f"]).optional(),
  notificationPrefs: z
    .object({
      emailMarketing: z.boolean(),
      tripUpdates: z.boolean(),
      collaboratorInvites: z.boolean(),
    })
    .optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await ensureProfile(session.user);

  const [updated] = await db
    .update(profiles)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, session.user.id))
    .returning();

  return NextResponse.json({ profile: updated });
}
