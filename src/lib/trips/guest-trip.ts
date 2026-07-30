import { createDefaultPackingItems } from "@/lib/packing/defaults";

export type GuestStopStatus =
  | "to_visit"
  | "visited"
  | "skipped"
  | "cancelled"
  | "favorite";

export type GuestItemType = "attraction" | "hotel" | "custom";
export type GuestStopTimingMode = "arrive_by" | "depart_at";

export type GuestItineraryItem = {
  id: string;
  sortOrder: number;
  type: GuestItemType;
  name: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
  durationMins?: number | null;
  timingMode?: GuestStopTimingMode | null;
  timingMins?: number | null;
  customTravelDurationMins?: number | null;
  customTravelDistanceKm?: number | null;
  /** Mode used to travel from this stop to the next. Defaults to driving. */
  travelMode?: "driving" | "walking" | "bicycling" | "transit";
  status: GuestStopStatus;
  notes?: string | null;
};

export type GuestDay = {
  id: string;
  dayIndex: number;
  date?: string | null;
  title: string;
  notes?: string | null;
  routeSummary?: string | null;
  isRestDay?: boolean;
  items: GuestItineraryItem[];
};

export type GuestPackingItem = {
  id: string;
  label: string;
  packed: boolean;
  sortOrder: number;
  category?: string | null;
};

export type GuestTripDraft = {
  guestToken: string;
  title: string;
  description?: string;
  startLocation?: string;
  startPlaceId?: string | null;
  startAddress?: string | null;
  startLatitude?: number | null;
  startLongitude?: number | null;
  endLocation?: string;
  durationDays: number;
  days: GuestDay[];
  packingItems?: GuestPackingItem[];
  updatedAt: string;
};

export const GUEST_TRIP_STORAGE_KEY = "roadplan:guest-trip";

function defaultPacking(): GuestPackingItem[] {
  return createDefaultPackingItems((item) => ({
    id: crypto.randomUUID(),
    ...item,
  }));
}

export function createEmptyGuestTrip(
  partial?: Partial<
    Pick<
      GuestTripDraft,
      | "title"
      | "startLocation"
      | "startPlaceId"
      | "startAddress"
      | "startLatitude"
      | "startLongitude"
      | "endLocation"
    >
  >,
): GuestTripDraft {
  const title =
    partial?.title?.trim() ||
    (partial?.startLocation && partial?.endLocation
      ? `${partial.startLocation} → ${partial.endLocation}`
      : partial?.startLocation
        ? `From ${partial.startLocation}`
        : "Untitled road trip");

  return {
    guestToken: crypto.randomUUID(),
    title,
    startLocation: partial?.startLocation,
    startPlaceId: partial?.startPlaceId ?? null,
    startAddress: partial?.startAddress ?? null,
    startLatitude: partial?.startLatitude ?? null,
    startLongitude: partial?.startLongitude ?? null,
    endLocation: partial?.endLocation,
    durationDays: 1,
    days: [
      {
        id: crypto.randomUUID(),
        dayIndex: 1,
        title: "Day 1",
        items: [],
      },
    ],
    packingItems: defaultPacking(),
    updatedAt: new Date().toISOString(),
  };
}

export function readGuestTrip(): GuestTripDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_TRIP_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as GuestTripDraft;
    if (!draft.packingItems) {
      draft.packingItems = defaultPacking();
      writeGuestTrip(draft);
    }
    return draft;
  } catch {
    return null;
  }
}

export function writeGuestTrip(draft: GuestTripDraft) {
  if (typeof window === "undefined") return;
  const next = { ...draft, updatedAt: new Date().toISOString() };
  localStorage.setItem(GUEST_TRIP_STORAGE_KEY, JSON.stringify(next));
}

export function clearGuestTrip() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_TRIP_STORAGE_KEY);
}
