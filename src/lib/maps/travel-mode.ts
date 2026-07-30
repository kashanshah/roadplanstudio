export const TRAVEL_MODES = [
  "driving",
  "walking",
  "bicycling",
  "transit",
] as const;

export type TravelMode = (typeof TRAVEL_MODES)[number];

export function isTravelMode(value: unknown): value is TravelMode {
  return (
    typeof value === "string" &&
    (TRAVEL_MODES as readonly string[]).includes(value)
  );
}

export function normalizeTravelMode(value: unknown): TravelMode {
  return isTravelMode(value) ? value : "driving";
}

export function travelModeLabel(mode: TravelMode): string {
  switch (mode) {
    case "walking":
      return "walk";
    case "bicycling":
      return "bike";
    case "transit":
      return "transit";
    default:
      return "drive";
  }
}

export function travelModeTitle(mode: TravelMode): string {
  switch (mode) {
    case "walking":
      return "Walk";
    case "bicycling":
      return "Bike";
    case "transit":
      return "Transit";
    default:
      return "Car";
  }
}

/** Rough average speed (km/h) when Directions is unavailable. */
export function estimateSpeedKmh(mode: TravelMode): number {
  switch (mode) {
    case "walking":
      return 5;
    case "bicycling":
      return 15;
    case "transit":
      return 30;
    default:
      return 80;
  }
}
