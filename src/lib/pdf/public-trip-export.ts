import type {
  PlannerAccommodation,
  PlannerDay,
  PlannerItem,
  StopStatus,
  TravelMode,
} from "@/components/planner/planner-types";
import type { TripTemplate } from "@/data/trips/templates";

type PublicDayRow = {
  id: string;
  dayIndex: number;
  title: string;
  date: string | null;
  routeSummary: string | null;
  notes: string | null;
  isRestDay: string | boolean;
  items: Array<{
    id: string;
    name: string;
    address: string | null;
    type: string;
    notes: string | null;
    sortOrder: number;
    latitude: number | null;
    longitude: number | null;
    googlePlaceId: string | null;
    googleMapsUri?: string | null;
    durationMins: number | null;
    timingMode?: string | null;
    timingMins?: number | null;
    customTravelDurationMins?: number | null;
    customTravelDistanceKm?: number | null;
    travelMode?: string | null;
    status?: string | null;
  }>;
};

type PublicAccommodationRow = {
  id: string;
  dayId: string | null;
  name: string;
  address: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  isConfirmed: string;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  googleMapsUri?: string | null;
};

function asTravelMode(value: string | null | undefined): TravelMode {
  if (
    value === "walking" ||
    value === "bicycling" ||
    value === "transit" ||
    value === "driving"
  ) {
    return value;
  }
  return "driving";
}

function asStatus(value: string | null | undefined): StopStatus {
  if (
    value === "visited" ||
    value === "skipped" ||
    value === "cancelled" ||
    value === "favorite" ||
    value === "to_visit"
  ) {
    return value;
  }
  return "to_visit";
}

function mapItem(
  item: PublicDayRow["items"][number],
  index: number,
): PlannerItem {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    type: item.type,
    notes: item.notes,
    sortOrder: item.sortOrder ?? index,
    latitude: item.latitude,
    longitude: item.longitude,
    googlePlaceId: item.googlePlaceId,
    googleMapsUri: item.googleMapsUri ?? null,
    durationMins: item.durationMins,
    timingMode:
      item.timingMode === "arrive_by" || item.timingMode === "depart_at"
        ? item.timingMode
        : null,
    timingMins: item.timingMins ?? null,
    customTravelDurationMins: item.customTravelDurationMins ?? null,
    customTravelDistanceKm: item.customTravelDistanceKm ?? null,
    travelMode: asTravelMode(item.travelMode),
    status: asStatus(item.status),
  };
}

/** Map a public DB trip payload into planner shapes for PDF export. */
export function plannerPayloadFromPublicTrip(
  days: PublicDayRow[],
  accommodations: PublicAccommodationRow[] = [],
): { days: PlannerDay[]; accommodations: PlannerAccommodation[] } {
  return {
    days: days.map((day) => ({
      id: day.id,
      dayIndex: day.dayIndex,
      title: day.title,
      date: day.date,
      routeSummary: day.routeSummary,
      notes: day.notes,
      isRestDay: day.isRestDay === true || day.isRestDay === "true",
      items: [...day.items]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(mapItem),
    })),
    accommodations: accommodations.map((a) => ({
      id: a.id,
      dayId: a.dayId,
      name: a.name,
      address: a.address,
      checkInDate: a.checkInDate,
      checkOutDate: a.checkOutDate,
      isConfirmed: a.isConfirmed,
      latitude: a.latitude,
      longitude: a.longitude,
      googlePlaceId: a.googlePlaceId,
      googleMapsUri: a.googleMapsUri ?? null,
    })),
  };
}

/** Map a static marketing template into planner days for PDF export. */
export function plannerDaysFromTripTemplate(trip: TripTemplate): PlannerDay[] {
  return trip.days.map((day, dayIndex) => {
    const dayId = `template-${trip.slug}-day-${dayIndex + 1}`;
    return {
      id: dayId,
      dayIndex: dayIndex + 1,
      title: day.title,
      date: null,
      routeSummary: day.summary,
      notes: null,
      isRestDay: false,
      items: day.stops.map((stop, index) => ({
        id: `${dayId}-stop-${index + 1}`,
        name: stop.name,
        address: null,
        type: stop.type === "lodging" ? "hotel" : stop.type,
        notes: stop.note ?? null,
        sortOrder: index,
        latitude: stop.lat,
        longitude: stop.lng,
        googlePlaceId: null,
        googleMapsUri: null,
        durationMins: null,
        timingMode: null,
        timingMins: null,
        customTravelDurationMins: null,
        customTravelDistanceKm: null,
        travelMode: "driving" as const,
        status: "to_visit" as const,
      })),
    };
  });
}
