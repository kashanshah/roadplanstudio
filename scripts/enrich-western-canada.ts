/**
 * Enrich Western Canada manifest via Google Places API.
 * Usage: npx tsx scripts/enrich-western-canada.ts
 * Requires GOOGLE_MAPS_SERVER_API_KEY in env (.env.local loaded manually).
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  WESTERN_CANADA_BIAS,
  WESTERN_CANADA_DAYS,
  WESTERN_CANADA_TRIP,
  type ManifestStop,
} from "./data/western-canada-2026.manifest";

type ResolvedPlace = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  types: string[];
  googleMapsUri: string | null;
};

type ResolvedStop = ManifestStop & {
  resolved: ResolvedPlace | null;
  error?: string;
};

async function loadEnvLocal() {
  try {
    const { readFile } = await import("fs/promises");
    const envPath = path.join(process.cwd(), ".env.local");
    const raw = await readFile(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
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

async function resolvePlace(query: string): Promise<ResolvedPlace | null> {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");

  const body = {
    textQuery: query,
    pageSize: 5,
    languageCode: "en",
    regionCode: WESTERN_CANADA_BIAS.regionCode,
  };

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri",
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await res.json()) as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      location?: { latitude?: number; longitude?: number };
      types?: string[];
      googleMapsUri?: string;
    }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }

  const p = data.places?.[0];
  if (!p?.id || p.location?.latitude == null || p.location?.longitude == null) {
    return null;
  }

  return {
    placeId: p.id,
    name: p.displayName?.text || query,
    formattedAddress: p.formattedAddress ?? null,
    latitude: p.location.latitude,
    longitude: p.location.longitude,
    types: p.types ?? [],
    googleMapsUri: p.googleMapsUri ?? null,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveStop(stop: ManifestStop): Promise<ResolvedStop> {
  try {
    const resolved = await resolvePlace(stop.query);
    if (!resolved) {
      return {
        ...stop,
        resolved: null,
        error: "No Places match",
      };
    }
    return { ...stop, resolved };
  } catch (err) {
    return {
      ...stop,
      resolved: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  await loadEnvLocal();

  if (!process.env.GOOGLE_MAPS_SERVER_API_KEY) {
    console.error("Missing GOOGLE_MAPS_SERVER_API_KEY");
    process.exit(1);
  }

  const days = [];
  let failures = 0;

  for (const day of WESTERN_CANADA_DAYS) {
    console.log(`\nDay ${day.dayIndex}: ${day.title}`);
    const stops: ResolvedStop[] = [];
    for (const stop of day.stops) {
      process.stdout.write(`  · ${stop.key}… `);
      const resolved = await resolveStop(stop);
      if (!resolved.resolved) {
        console.log(`FAIL ${resolved.error}`);
        if (!stop.optional) failures += 1;
      } else {
        console.log(resolved.resolved.name);
      }
      stops.push(resolved);
      await sleep(200);
    }

    let overnight: ResolvedStop | undefined;
    if (day.overnight) {
      process.stdout.write(`  · overnight ${day.overnight.key}… `);
      overnight = await resolveStop(day.overnight);
      if (!overnight.resolved) {
        console.log(`FAIL ${overnight.error}`);
        failures += 1;
      } else {
        console.log(overnight.resolved.name);
      }
      await sleep(200);
    }

    days.push({
      dayIndex: day.dayIndex,
      date: day.date,
      title: day.title,
      routeSummary: day.routeSummary,
      notes: day.notes ?? null,
      stops,
      overnight: overnight ?? null,
    });
  }

  const out = {
    trip: WESTERN_CANADA_TRIP,
    enrichedAt: new Date().toISOString(),
    days,
  };

  const outDir = path.join(process.cwd(), "src/data/seeds");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "western-canada-2026.resolved.json");
  await writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);

  if (failures > 0) {
    console.error(`\n${failures} required stop(s) failed to resolve.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
