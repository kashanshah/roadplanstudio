import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import {
  accommodations,
  itineraryItems,
  packingItems,
  tripDays,
  trips,
} from "@/lib/db/schema";
import { ensureProfile } from "@/lib/trips/ensure-profile";
import { createDefaultPackingItems } from "@/lib/packing/defaults";

const guestItemSchema = z.object({
  id: z.string().optional(),
  sortOrder: z.number().int().nonnegative(),
  type: z.enum(["attraction", "hotel", "custom"]),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  googlePlaceId: z.string().nullable().optional(),
  durationMins: z.number().int().nullable().optional(),
  timingMode: z.enum(["arrive_by", "depart_at"]).nullable().optional(),
  timingMins: z.number().int().min(0).max(24 * 60 - 1).nullable().optional(),
  travelMode: z
    .enum(["driving", "walking", "bicycling", "transit"])
    .optional()
    .default("driving"),
  status: z
    .enum(["to_visit", "visited", "skipped", "cancelled", "favorite"])
    .default("to_visit"),
  notes: z.string().nullable().optional(),
});

const guestDaySchema = z.object({
  id: z.string().optional(),
  dayIndex: z.number().int().positive(),
  date: z.string().nullable().optional(),
  title: z.string().min(1),
  notes: z.string().nullable().optional(),
  routeSummary: z.string().nullable().optional(),
  isRestDay: z.boolean().optional().default(false),
  items: z.array(guestItemSchema).default([]),
});

const claimSchema = z.object({
  guestToken: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startLocation: z.string().optional(),
  startPlaceId: z.string().nullable().optional(),
  startAddress: z.string().nullable().optional(),
  startLatitude: z.number().nullable().optional(),
  startLongitude: z.number().nullable().optional(),
  endLocation: z.string().optional(),
  durationDays: z.number().int().positive().default(1),
  days: z.array(guestDaySchema).default([]),
  packingItems: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1).max(200),
        packed: z.boolean().optional().default(false),
        sortOrder: z.number().int().nonnegative().optional(),
        category: z.string().nullable().optional(),
      }),
    )
    .optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = claimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid guest trip payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await ensureProfile(session.user);

  const draft = parsed.data;

  try {
    const [trip] = await db
      .insert(trips)
      .values({
        ownerId: session.user.id,
        title: draft.title,
        description:
          draft.description ||
          [draft.startLocation, draft.endLocation].filter(Boolean).join(" → ") ||
          null,
        startPlaceId: draft.startPlaceId ?? null,
        startPlaceName: draft.startLocation ?? null,
        startAddress: draft.startAddress ?? null,
        startLatitude: draft.startLatitude ?? null,
        startLongitude: draft.startLongitude ?? null,
        durationDays: Math.max(draft.durationDays, draft.days.length || 1),
        visibility: "private",
        lastEditedBy: session.user.id,
      })
      .returning();

    for (const day of draft.days) {
      const [createdDay] = await db
        .insert(tripDays)
        .values({
          tripId: trip.id,
          dayIndex: day.dayIndex,
          date: day.date || null,
          title: day.title,
          notes: day.notes || null,
          routeSummary: day.routeSummary || null,
          isRestDay: day.isRestDay ? "true" : "false",
        })
        .returning();

      if (day.items.length) {
        await db.insert(itineraryItems).values(
          day.items.map((item) => ({
            dayId: createdDay.id,
            sortOrder: item.sortOrder,
            type: item.type,
            name: item.name,
            address: item.address ?? null,
            latitude: item.latitude ?? null,
            longitude: item.longitude ?? null,
            googlePlaceId: item.googlePlaceId ?? null,
            durationMins: item.durationMins ?? null,
            timingMode: item.timingMode ?? null,
            timingMins: item.timingMins ?? null,
            travelMode: item.travelMode ?? "driving",
            status: item.status,
            notes: item.notes ?? null,
          })),
        );
      }

      const hotelItem = day.items.find((i) => i.type === "hotel");
      if (hotelItem) {
        await db.insert(accommodations).values({
          tripId: trip.id,
          dayId: createdDay.id,
          name: hotelItem.name,
          address: hotelItem.address ?? null,
          latitude: hotelItem.latitude ?? null,
          longitude: hotelItem.longitude ?? null,
          googlePlaceId: hotelItem.googlePlaceId ?? null,
          checkInDate: day.date || null,
        });
      }
    }

    const packing =
      draft.packingItems && draft.packingItems.length
        ? draft.packingItems.map((item, index) => ({
            tripId: trip.id,
            label: item.label,
            packed: item.packed ? "true" : "false",
            sortOrder: item.sortOrder ?? index,
          }))
        : createDefaultPackingItems((item) => ({
            tripId: trip.id,
            label: item.label,
            packed: "false",
            sortOrder: item.sortOrder,
          }));

    if (packing.length) {
      await db.insert(packingItems).values(packing);
    }

    return NextResponse.json({ tripId: trip.id });
  } catch (err) {
    console.error("claim trip failed", err);
    return NextResponse.json(
      { error: "Failed to save guest trip" },
      { status: 500 },
    );
  }
}
