import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { activityLogs, tripDays, trips } from "@/lib/db/schema";
import { duplicateTemplateForUser } from "@/lib/trips/duplicate";
import { ensureProfile } from "@/lib/trips/ensure-profile";

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  durationDays: z.number().int().positive().max(60).default(1),
  visibility: z.enum(["private", "unlisted", "public"]).default("private"),
  templateSlug: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { desc, eq } = await import("drizzle-orm");
  const owned = await db
    .select()
    .from(trips)
    .where(eq(trips.ownerId, session.user.id))
    .orderBy(desc(trips.updatedAt));

  return NextResponse.json({ trips: owned });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  if (input.templateSlug) {
    try {
      const trip = await duplicateTemplateForUser({
        slug: input.templateSlug,
        userId: session.user.id,
        userName: session.user.name,
      });
      return NextResponse.json({ trip }, { status: 201 });
    } catch (err) {
      if (err instanceof Error && err.message === "TEMPLATE_NOT_FOUND") {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      console.error("duplicate template failed", err);
      return NextResponse.json({ error: "Failed to duplicate" }, { status: 500 });
    }
  }

  if (!input.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  await ensureProfile(session.user);

  const [trip] = await db
    .insert(trips)
    .values({
      ownerId: session.user.id,
      title: input.title,
      description: input.description ?? null,
      durationDays: input.durationDays,
      visibility: input.visibility,
      lastEditedBy: session.user.id,
    })
    .returning();

  await db.insert(tripDays).values({
    tripId: trip.id,
    dayIndex: 1,
    title: "Day 1",
  });

  await db.insert(activityLogs).values({
    tripId: trip.id,
    userId: session.user.id,
    action: "trip.created",
    metadata: { title: trip.title },
  });

  return NextResponse.json({ trip }, { status: 201 });
}
