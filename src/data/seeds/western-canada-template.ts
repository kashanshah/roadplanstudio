import resolved from "@/data/seeds/western-canada-2026.resolved.json";
import type { TripTemplateDay } from "@/data/trips/templates";

type ResolvedPlace = {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  googleMapsUri?: string | null;
};

type ResolvedStop = {
  key: string;
  query: string;
  type: string;
  optional?: boolean;
  notes?: string | null;
  resolved?: ResolvedPlace | null;
};

type ResolvedDay = {
  dayIndex: number;
  date: string;
  title: string;
  routeSummary: string;
  notes?: string | null;
  stops: ResolvedStop[];
  overnight?: ResolvedStop | null;
};

const seed = resolved as {
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

function stopName(stop: ResolvedStop) {
  return stop.resolved?.name || stop.query.split(",")[0] || stop.key;
}

function stopType(
  type: string,
): "attraction" | "lodging" | "waypoint" {
  if (type === "hotel" || type === "city_overnight") return "lodging";
  if (type === "custom" || type === "transit") return "waypoint";
  return "attraction";
}

/** Marketing / Discover day spine — all 13 days from the Places-resolved seed. */
export function westernCanadaTemplateDays(): TripTemplateDay[] {
  return seed.days.map((day) => {
    const stops = [
      ...day.stops.map((stop) => ({
        name: stopName(stop),
        type: stopType(stop.type),
        lat: stop.resolved?.latitude ?? 0,
        lng: stop.resolved?.longitude ?? 0,
        note:
          [stop.optional ? "Optional" : null, stop.notes]
            .filter(Boolean)
            .join(" · ") || undefined,
      })),
      ...(day.overnight
        ? [
            {
              name: stopName(day.overnight),
              type: "lodging" as const,
              lat: day.overnight.resolved?.latitude ?? 0,
              lng: day.overnight.resolved?.longitude ?? 0,
              note: day.overnight.notes ?? "Overnight",
            },
          ]
        : []),
    ];

    return {
      title: day.title.replace(/^Day \d+\s*[–-]\s*/, ""),
      summary: [day.routeSummary, day.notes].filter(Boolean).join(" · "),
      stops,
    };
  });
}

/** Full remix source used when Neon seed is unavailable. */
export function westernCanadaStaticTemplateSource() {
  const days = seed.days.map((day) => {
    const dayId = `template:${seed.trip.slug}:day:${day.dayIndex}`;
    const items = [
      ...day.stops.map((stop, stopIndex) => ({
        id: `${dayId}:item:${stopIndex + 1}`,
        dayId,
        sortOrder: stopIndex,
        type:
          stop.type === "hotel"
            ? ("hotel" as const)
            : stop.type === "custom" || stop.type === "transit"
              ? ("custom" as const)
              : ("attraction" as const),
        googlePlaceId: stop.resolved?.placeId ?? null,
        name: stopName(stop),
        address: stop.resolved?.formattedAddress ?? null,
        latitude: stop.resolved?.latitude ?? null,
        longitude: stop.resolved?.longitude ?? null,
        durationMins: null,
        timingMode: null,
        timingMins: null,
        customTravelDurationMins: null,
        customTravelDistanceKm: null,
        travelMode: "driving" as const,
        status: "to_visit" as const,
        notes: stop.notes ?? (stop.optional ? "Optional" : null),
        googleMapsUri: stop.resolved?.googleMapsUri ?? null,
      })),
      ...(day.overnight
        ? [
            {
              id: `${dayId}:overnight`,
              dayId,
              sortOrder: day.stops.length,
              type: "hotel" as const,
              googlePlaceId: day.overnight.resolved?.placeId ?? null,
              name: stopName(day.overnight),
              address: day.overnight.resolved?.formattedAddress ?? null,
              latitude: day.overnight.resolved?.latitude ?? null,
              longitude: day.overnight.resolved?.longitude ?? null,
              durationMins: null,
              timingMode: null,
              timingMins: null,
              customTravelDurationMins: null,
              customTravelDistanceKm: null,
              travelMode: "driving" as const,
              status: "to_visit" as const,
              notes: day.overnight.notes ?? "Overnight",
              googleMapsUri: day.overnight.resolved?.googleMapsUri ?? null,
            },
          ]
        : []),
    ];

    return {
      id: dayId,
      dayIndex: day.dayIndex,
      date: day.date,
      title: day.title,
      notes: day.notes ?? null,
      routeSummary: day.routeSummary,
      isRestDay: "false" as const,
      items,
    };
  });

  return {
    trip: {
      id: `template:${seed.trip.slug}`,
      slug: seed.trip.slug,
      title: seed.trip.title,
      description: seed.trip.description,
      coverPhotoUrl: seed.trip.coverPhotoUrl,
      durationDays: seed.trip.durationDays,
      totalDistanceKm: seed.trip.totalDistanceKm,
      difficulty: seed.trip.difficulty,
      visibility: seed.trip.visibility,
    },
    days,
  };
}
