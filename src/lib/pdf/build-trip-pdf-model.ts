import { SITE_URL } from "@/lib/constants";
import { DEFAULT_PACKING_TEMPLATE } from "@/lib/packing/defaults";
import type {
  BuildTripPdfInput,
  TripPdfDay,
  TripPdfModel,
  TripPdfStop,
} from "@/lib/pdf/trip-pdf-types";
import type { PlannerAccommodation } from "@/components/planner/planner-types";

function mapsUrlFor(opts: {
  googleMapsUri?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  name?: string | null;
  address?: string | null;
}) {
  if (opts.googleMapsUri) return opts.googleMapsUri;
  if (opts.latitude != null && opts.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${opts.latitude},${opts.longitude}`;
  }
  const q = [opts.name, opts.address].filter(Boolean).join(", ");
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function lodgingForDay(
  dayId: string,
  accommodations: PlannerAccommodation[],
  dayTitle: string,
) {
  const match =
    accommodations.find((a) => a.dayId === dayId) ??
    null;
  if (!match) return null;
  return {
    name: match.name,
    address: match.address,
    checkInDate: match.checkInDate,
    checkOutDate: match.checkOutDate,
    confirmed: match.isConfirmed === "true" || match.isConfirmed === "1",
    mapsUrl: mapsUrlFor(match),
    dayTitle,
  };
}

const DEFAULT_TIPS = [
  "Keep overnight towns fixed; remix attractions inside each day.",
  "Treat mountain and coastal days as 4–5 hours of wheel time max.",
  "Tap stop links in this PDF to open Google Maps directions.",
  "Mark visited / skipped statuses in RoadPlan while you travel.",
  "Leave one recovery overnight every 3–4 days.",
];

export function buildTripPdfModel(input: BuildTripPdfInput): TripPdfModel {
  const accommodations = input.accommodations ?? [];
  const sortedDays = [...input.days].sort((a, b) => a.dayIndex - b.dayIndex);

  const days: TripPdfDay[] = sortedDays.map((day) => {
    const items = [...day.items].sort((a, b) => a.sortOrder - b.sortOrder);
    const stops: TripPdfStop[] = items.map((item, index) => ({
      id: item.id,
      index: index + 1,
      name: item.name,
      address: item.address,
      type: item.type || "custom",
      notes: item.notes,
      status: item.status || "to_visit",
      durationMins: item.durationMins,
      timingMode: item.timingMode ?? null,
      timingMins: item.timingMins ?? null,
      customTravelDurationMins: item.customTravelDurationMins ?? null,
      customTravelDistanceKm: item.customTravelDistanceKm ?? null,
      travelMode: item.travelMode || "driving",
      latitude: item.latitude,
      longitude: item.longitude,
      mapsUrl: mapsUrlFor(item),
    }));

    // Prefer accommodation rows; else hotel-type stop as lodging hint
    const lodgingFromTable = lodgingForDay(day.id, accommodations, day.title);
    const hotelStop = stops.find((s) => s.type === "hotel");
    const lodging =
      lodgingFromTable ??
      (hotelStop
        ? {
            name: hotelStop.name,
            address: hotelStop.address,
            checkInDate: day.date,
            checkOutDate: null,
            confirmed: false,
            mapsUrl: hotelStop.mapsUrl,
          }
        : null);

    const plannedMins = stops.reduce(
      (sum, s) => sum + (s.durationMins ?? 0),
      0,
    );

    return {
      id: day.id,
      dayNumber: day.dayIndex + 1,
      title: day.title || `Day ${day.dayIndex + 1}`,
      date: day.date,
      routeSummary: day.routeSummary,
      notes: day.notes,
      stops,
      stopCount: stops.length,
      plannedMins,
      lodging,
    };
  });

  const lodgingIndex: TripPdfModel["accommodations"] = days
    .filter((d) => d.lodging)
    .map((d) => ({
      name: d.lodging!.name,
      address: d.lodging!.address,
      checkInDate: d.lodging!.checkInDate,
      checkOutDate: d.lodging!.checkOutDate,
      confirmed: d.lodging!.confirmed,
      dayTitle: `Day ${d.dayNumber} · ${d.title}`,
      mapsUrl: d.lodging!.mapsUrl,
    }));

  // Also include accommodations not tied to a day
  for (const a of accommodations) {
    if (a.dayId && days.some((d) => d.id === a.dayId)) continue;
    lodgingIndex.push({
      name: a.name,
      address: a.address,
      checkInDate: a.checkInDate,
      checkOutDate: a.checkOutDate,
      confirmed: a.isConfirmed === "true" || a.isConfirmed === "1",
      dayTitle: null,
      mapsUrl: mapsUrlFor(a),
    });
  }

  const totalStops = days.reduce((n, d) => n + d.stopCount, 0);
  const totalPlannedMins = days.reduce((n, d) => n + d.plannedMins, 0);

  const packingChecklist =
    input.packingItems && input.packingItems.length
      ? [...input.packingItems]
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((item) => ({
            label: item.label,
            packed: !!item.packed,
            category: item.category ?? null,
          }))
      : DEFAULT_PACKING_TEMPLATE.map((item) => ({
          label: item.label,
          packed: false,
          category: item.category,
        }));

  return {
    title: input.title.trim() || "Untitled road trip",
    description: input.description ?? null,
    exportedAt: new Date().toISOString(),
    siteUrl: input.siteUrl ?? SITE_URL,
    plannerUrl: input.plannerUrl ?? null,
    durationDays: input.durationDays ?? Math.max(days.length, 1),
    totalStops,
    totalPlannedMins,
    totalDistanceKm: input.totalDistanceKm ?? null,
    difficulty: input.difficulty ?? null,
    visibility: input.visibility ?? null,
    startLabel: input.startLocation ?? days[0]?.stops[0]?.name ?? null,
    endLabel:
      input.endLocation ??
      days[days.length - 1]?.stops[days[days.length - 1]!.stops.length - 1]
        ?.name ??
      null,
    days,
    accommodations: lodgingIndex,
    packingChecklist,
    tips: DEFAULT_TIPS,
  };
}
