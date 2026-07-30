import type { TravelMode } from "@/lib/maps/travel-mode";

export type StopStatus =
  | "to_visit"
  | "visited"
  | "skipped"
  | "cancelled"
  | "favorite";

export type { TravelMode };
export type StopTimingMode = "arrive_by" | "depart_at";

export type PlannerItem = {
  id: string;
  name: string;
  address: string | null;
  type: string;
  notes: string | null;
  sortOrder: number;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  googleMapsUri: string | null;
  durationMins: number | null;
  /** Optional time anchor used to shift the day timeline. */
  timingMode: StopTimingMode | null;
  /** Minutes from local midnight (0-1439) for arrive/depart anchor. */
  timingMins: number | null;
  /** Mode used to travel from this stop to the next. */
  travelMode: TravelMode;
  status: StopStatus;
};

export type PlannerDay = {
  id: string;
  dayIndex: number;
  title: string;
  date: string | null;
  routeSummary: string | null;
  notes: string | null;
  isRestDay: boolean;
  items: PlannerItem[];
};

export type PlannerAccommodation = {
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
  googleMapsUri: string | null;
};

export type PlannerPackingItem = {
  id: string;
  label: string;
  packed: boolean;
  sortOrder: number;
  category?: string | null;
};

export type PlaceDetailsPayload = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  types: string[];
  googleMapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  editorialSummary: string | null;
  websiteUri: string | null;
  nationalPhoneNumber: string | null;
  regularOpeningHours: string[] | null;
  photoNames: string[];
  priceLevel: string | null;
  estimatedDurationMins: number;
};

export function formatDuration(mins: number | null | undefined) {
  if (mins == null || mins <= 0) return null;
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function statusLabel(status: StopStatus) {
  switch (status) {
    case "visited":
      return "Visited";
    case "favorite":
      return "Favorite";
    case "skipped":
      return "Skipped";
    case "cancelled":
      return "Cancelled";
    default:
      return "To visit";
  }
}

export function nextCheckboxStatus(status: StopStatus): StopStatus {
  return status === "visited" ? "to_visit" : "visited";
}
