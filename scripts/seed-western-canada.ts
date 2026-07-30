/**
 * Seed Western Canada 2026 from resolved Places JSON into Neon.
 * Usage: npx tsx scripts/seed-western-canada.ts
 */

import { readFile } from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { withDayOpeningBases } from "../src/data/seeds/overnight-carry-forward";
import * as schema from "../src/lib/db/schema";

const SEED_OWNER_ID = "seed-roadplan-studio";
const SEED_OWNER_EMAIL = "seed@roadplanstudio.com";

type ResolvedPlace = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  types: string[];
  googleMapsUri: string | null;
};

type ResolvedStop = {
  key: string;
  query: string;
  type: string;
  optional?: boolean;
  notes?: string;
  resolved: ResolvedPlace | null;
};

type ResolvedDay = {
  dayIndex: number;
  date: string;
  title: string;
  routeSummary: string;
  notes: string | null;
  stops: ResolvedStop[];
  overnight: ResolvedStop | null;
};

type ResolvedSeed = {
  trip: {
    title: string;
    slug: string;
    description: string;
    coverPhotoUrl: string;
    durationDays: number;
    totalDistanceKm: number;
    difficulty: "easy" | "moderate" | "hard";
    visibility: "private" | "unlisted" | "public";
  };
  days: ResolvedDay[];
};

async function loadEnvLocal() {
  try {
    const envPath = path.join(process.cwd(), ".env.local");
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function mapItemType(
  type: string,
): "attraction" | "hotel" | "custom" {
  if (type === "hotel" || type === "city_overnight") return "hotel";
  if (type === "attraction") return "attraction";
  return "custom";
}

async function main() {
  await loadEnvLocal();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const resolvedPath = path.join(
    process.cwd(),
    "src/data/seeds/western-canada-2026.resolved.json",
  );
  const raw = await readFile(resolvedPath, "utf8");
  const seed = JSON.parse(raw) as ResolvedSeed;

  const sql = neon(databaseUrl);
  const db = drizzle({ client: sql, schema });

  // Ensure Better Auth user + profile for seed owner (raw SQL for auth user table)
  await sql`
    INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
    VALUES (
      ${SEED_OWNER_ID},
      ${"RoadPlan Studio"},
      ${SEED_OWNER_EMAIL},
      ${true},
      ${null},
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `;

  await db
    .insert(schema.profiles)
    .values({
      userId: SEED_OWNER_ID,
      fullName: "RoadPlan Studio",
    })
    .onConflictDoNothing();

  const [existing] = await db
    .select()
    .from(schema.trips)
    .where(eq(schema.trips.slug, seed.trip.slug))
    .limit(1);

  if (existing) {
    await db.delete(schema.trips).where(eq(schema.trips.id, existing.id));
    console.log(`Removed existing trip ${seed.trip.slug}`);
  }

  const daysWithMorningBase = withDayOpeningBases(seed.days);
  const tripStart = daysWithMorningBase[0]?.stops[0]?.resolved ?? null;

  const [trip] = await db
    .insert(schema.trips)
    .values({
      ownerId: SEED_OWNER_ID,
      title: seed.trip.title,
      slug: seed.trip.slug,
      description: seed.trip.description,
      coverPhotoUrl: seed.trip.coverPhotoUrl,
      startPlaceId: tripStart?.placeId ?? null,
      startPlaceName: tripStart?.name ?? null,
      startAddress: tripStart?.formattedAddress ?? null,
      startLatitude: tripStart?.latitude ?? null,
      startLongitude: tripStart?.longitude ?? null,
      durationDays: seed.trip.durationDays,
      totalDistanceKm: seed.trip.totalDistanceKm,
      difficulty: seed.trip.difficulty,
      visibility: seed.trip.visibility,
      lastEditedBy: SEED_OWNER_ID,
    })
    .returning();

  for (const day of daysWithMorningBase) {
    const [createdDay] = await db
      .insert(schema.tripDays)
      .values({
        tripId: trip.id,
        dayIndex: day.dayIndex,
        date: day.date,
        title: day.title,
        notes: day.notes,
        routeSummary: day.routeSummary,
      })
      .returning();

    const itemRows = day.stops.map((stop, index) => {
      const types = stop.resolved?.types ?? [];
      const isLodging = stop.type === "hotel" || stop.type === "city_overnight";
      const isTripStart = day.dayIndex === 1 && index === 0;
      const durationMins =
        isLodging || isTripStart
          ? 0
          : types.includes("museum") || types.includes("art_gallery")
            ? 120
            : types.includes("park") || types.includes("national_park")
              ? 150
              : types.includes("shopping_mall")
                ? 90
                : types.includes("restaurant") || types.includes("cafe")
                  ? 75
                  : types.includes("tourist_attraction")
                    ? 90
                    : stop.type === "custom"
                      ? 30
                      : 60;

      return {
        dayId: createdDay.id,
        sortOrder: index,
        type: mapItemType(stop.type),
        googlePlaceId: stop.resolved?.placeId ?? null,
        name: stop.resolved?.name ?? stop.query,
        address: stop.resolved?.formattedAddress ?? null,
        latitude: stop.resolved?.latitude ?? null,
        longitude: stop.resolved?.longitude ?? null,
        durationMins,
        status: "to_visit" as const,
        notes: [stop.notes, stop.optional ? "optional" : null]
          .filter(Boolean)
          .join(" · ") || null,
        googleMapsUri: stop.resolved?.googleMapsUri ?? null,
      };
    });

    if (itemRows.length) {
      await db.insert(schema.itineraryItems).values(itemRows);
    }

    if (day.overnight) {
      const o = day.overnight;
      await db.insert(schema.accommodations).values({
        tripId: trip.id,
        dayId: createdDay.id,
        googlePlaceId: o.resolved?.placeId ?? null,
        name: o.resolved?.name ?? o.query,
        address: o.resolved?.formattedAddress ?? null,
        latitude: o.resolved?.latitude ?? null,
        longitude: o.resolved?.longitude ?? null,
        checkInDate: day.date,
        googleMapsUri: o.resolved?.googleMapsUri ?? null,
        isConfirmed: o.type === "hotel" ? "true" : "false",
        bookingDetails: {
          source: "seed",
          notes: o.notes ?? null,
          query: o.query,
        },
      });

      await db.insert(schema.itineraryItems).values({
        dayId: createdDay.id,
        sortOrder: itemRows.length,
        type: "hotel",
        googlePlaceId: o.resolved?.placeId ?? null,
        name: o.resolved?.name ?? o.query,
        address: o.resolved?.formattedAddress ?? null,
        latitude: o.resolved?.latitude ?? null,
        longitude: o.resolved?.longitude ?? null,
        durationMins: 0,
        status: "to_visit",
        notes: o.notes ?? "Overnight",
        googleMapsUri: o.resolved?.googleMapsUri ?? null,
      });
    }
  }

  console.log(`Seeded trip ${trip.slug} (${trip.id}) with ${seed.days.length} days`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
