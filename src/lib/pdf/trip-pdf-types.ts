import type {
  PlannerAccommodation,
  PlannerDay,
  StopStatus,
  TravelMode,
} from "@/components/planner/planner-types";

export type TripPdfStop = {
  id: string;
  index: number;
  name: string;
  address: string | null;
  type: string;
  notes: string | null;
  status: StopStatus;
  durationMins: number | null;
  timingMode: "arrive_by" | "depart_at" | null;
  timingMins: number | null;
  customTravelDurationMins: number | null;
  customTravelDistanceKm: number | null;
  travelMode: TravelMode;
  latitude: number | null;
  longitude: number | null;
  mapsUrl: string | null;
};

export type TripPdfDay = {
  id: string;
  dayNumber: number;
  title: string;
  date: string | null;
  routeSummary: string | null;
  notes: string | null;
  stops: TripPdfStop[];
  stopCount: number;
  plannedMins: number;
  lodging: {
    name: string;
    address: string | null;
    checkInDate: string | null;
    checkOutDate: string | null;
    confirmed: boolean;
    mapsUrl: string | null;
  } | null;
};

export type TripPdfModel = {
  title: string;
  description: string | null;
  exportedAt: string;
  siteUrl: string;
  plannerUrl: string | null;
  durationDays: number;
  totalStops: number;
  totalPlannedMins: number;
  totalDistanceKm: number | null;
  difficulty: string | null;
  visibility: string | null;
  startLabel: string | null;
  endLabel: string | null;
  days: TripPdfDay[];
  accommodations: Array<{
    name: string;
    address: string | null;
    checkInDate: string | null;
    checkOutDate: string | null;
    confirmed: boolean;
    dayTitle: string | null;
    mapsUrl: string | null;
  }>;
  packingChecklist: Array<{
    label: string;
    packed: boolean;
    category?: string | null;
  }>;
  tips: string[];
};

export type BuildTripPdfInput = {
  title: string;
  description?: string | null;
  days: PlannerDay[];
  accommodations?: PlannerAccommodation[];
  packingItems?: Array<{
    label: string;
    packed: boolean;
    sortOrder?: number;
    category?: string | null;
  }>;
  durationDays?: number;
  totalDistanceKm?: number | null;
  difficulty?: string | null;
  visibility?: string | null;
  plannerUrl?: string | null;
  startLocation?: string | null;
  endLocation?: string | null;
  siteUrl?: string;
};
