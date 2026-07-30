export type GuestStopStatus =
  | "to_visit"
  | "visited"
  | "skipped"
  | "cancelled"
  | "favorite";

export type GuestItemType = "attraction" | "hotel" | "custom";

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

export type GuestTripDraft = {
  guestToken: string;
  title: string;
  description?: string;
  startLocation?: string;
  endLocation?: string;
  durationDays: number;
  days: GuestDay[];
  updatedAt: string;
};

export const GUEST_TRIP_STORAGE_KEY = "roadplan:guest-trip";

export function createEmptyGuestTrip(
  partial?: Partial<
    Pick<GuestTripDraft, "title" | "startLocation" | "endLocation">
  >,
): GuestTripDraft {
  const title =
    partial?.title?.trim() ||
    (partial?.startLocation && partial?.endLocation
      ? `${partial.startLocation} → ${partial.endLocation}`
      : "Untitled road trip");

  return {
    guestToken: crypto.randomUUID(),
    title,
    startLocation: partial?.startLocation,
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
    updatedAt: new Date().toISOString(),
  };
}

export function readGuestTrip(): GuestTripDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_TRIP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestTripDraft;
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
