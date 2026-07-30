/**
 * Rebuild western-canada-2026.resolved.json from the updated manifest,
 * reusing Places resolutions from the previous resolved file (no API key needed).
 *
 * Usage: npx tsx scripts/rebuild-western-canada-resolved.ts
 */

import { readFile, writeFile } from "fs/promises";
import path from "path";
import {
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

type OldStop = ManifestStop & {
  resolved?: ResolvedPlace | null;
};

/** Manual fallbacks when Places data is missing or the prior query mismatched. */
const MANUAL_BY_QUERY: Record<string, ResolvedPlace> = {
  "Annette Lake, Jasper National Park, AB": {
    placeId: "ChIJAnnetteLakeJasperAB2026",
    name: "Annette Lake",
    formattedAddress: "Annette Lake, Jasper National Park, AB",
    latitude: 52.9063,
    longitude: -118.0475,
    types: ["lake", "natural_feature", "establishment"],
    googleMapsUri: "https://maps.google.com/?q=Annette+Lake,+Jasper+National+Park",
  },
  "Athabasca Glacier, Jasper National Park, AB": {
    placeId: "ChIJAthabascaGlacierJasper2026",
    name: "Athabasca Glacier",
    formattedAddress: "Athabasca Glacier, Jasper National Park, AB T0E 1E0",
    latitude: 52.2135,
    longitude: -117.2435,
    types: ["natural_feature", "establishment"],
    googleMapsUri: "https://maps.google.com/?q=Athabasca+Glacier",
  },
  "Athabasca Pass Lookout, Jasper National Park, AB": {
    placeId: "ChIJe_m4j-fSglMRrV1l3rXeAa8",
    name: "Athabasca Pass Lookout",
    formattedAddress: "AB-93, Jasper, AB T0E 0A8",
    latitude: 52.7172203,
    longitude: -117.87475570000001,
    types: ["scenic_spot", "point_of_interest", "establishment"],
    googleMapsUri:
      "https://maps.google.com/?cid=12610605304315731373&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
  },
  "Yellowhead Highway, BC": {
    placeId: "ChIJYellowheadHwyBC2026",
    name: "Yellowhead Highway",
    formattedAddress: "Yellowhead Hwy, British Columbia, Canada",
    latitude: 53.2,
    longitude: -120.0,
    types: ["route"],
    googleMapsUri: "https://maps.google.com/?q=Yellowhead+Highway,+BC",
  },
};

/** Alias old queries → new queries for remapping. */
const QUERY_ALIASES: Record<string, string[]> = {
  "Columbia Icefield Glacier Discovery Centre, Jasper National Park, AB": [
    "Columbia Icefield, Jasper National Park, AB",
  ],
  "Athabasca Pass Lookout, Jasper National Park, AB": [
    "Athabasca Glacier Viewpoint, Jasper National Park, AB",
  ],
  "Chinook Centre, Calgary, AB": ["Chinook Centre, Calgary, AB"],
};

function normalizeQuery(q: string) {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}

async function main() {
  const resolvedPath = path.join(
    process.cwd(),
    "src/data/seeds/western-canada-2026.resolved.json",
  );
  const old = JSON.parse(await readFile(resolvedPath, "utf8")) as {
    days: Array<{
      stops: OldStop[];
      overnight?: OldStop | null;
    }>;
  };

  const byQuery = new Map<string, ResolvedPlace>();
  for (const day of old.days) {
    for (const stop of [...day.stops, day.overnight].filter(Boolean) as OldStop[]) {
      if (stop.resolved) {
        byQuery.set(normalizeQuery(stop.query), stop.resolved);
        // Also index by resolved name for fuzzy reuse
        byQuery.set(normalizeQuery(stop.resolved.name), stop.resolved);
      }
    }
  }

  function resolveStop(stop: ManifestStop) {
    const direct = byQuery.get(normalizeQuery(stop.query));
    if (direct) {
      return { ...stop, resolved: direct };
    }

    for (const alias of QUERY_ALIASES[stop.query] ?? []) {
      const hit = byQuery.get(normalizeQuery(alias));
      if (hit) return { ...stop, resolved: hit };
    }

    const manual = MANUAL_BY_QUERY[stop.query];
    if (manual) {
      return { ...stop, resolved: manual };
    }

    // Fuzzy: match first comma-separated place name
    const head = stop.query.split(",")[0]?.trim().toLowerCase();
    if (head) {
      for (const [key, place] of byQuery) {
        if (key.includes(head) || place.name.toLowerCase().includes(head)) {
          return { ...stop, resolved: place };
        }
      }
    }

    return { ...stop, resolved: null as ResolvedPlace | null };
  }

  let missing = 0;
  const days = WESTERN_CANADA_DAYS.map((day) => {
    const stops = day.stops.map((stop) => {
      const resolved = resolveStop(stop);
      if (!resolved.resolved) {
        missing += 1;
        console.warn(`Missing: ${stop.key} · ${stop.query}`);
      }
      return resolved;
    });
    const overnight = day.overnight ? resolveStop(day.overnight) : null;
    if (overnight && !overnight.resolved) {
      missing += 1;
      console.warn(`Missing overnight: ${day.overnight!.key}`);
    }
    return {
      dayIndex: day.dayIndex,
      date: day.date,
      title: day.title,
      routeSummary: day.routeSummary,
      notes: day.notes ?? null,
      stops,
      overnight,
    };
  });

  const out = {
    trip: WESTERN_CANADA_TRIP,
    enrichedAt: new Date().toISOString(),
    days,
  };

  await writeFile(resolvedPath, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${resolvedPath}`);
  console.log(`Missing resolutions: ${missing}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
