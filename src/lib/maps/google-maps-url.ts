import {
  normalizeTravelMode,
  type TravelMode,
} from "@/lib/maps/travel-mode";

export type MapsPlaceRef = {
  name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  googlePlaceId?: string | null;
};

function placeWaypoint(place: MapsPlaceRef): {
  text: string;
  placeId?: string;
} | null {
  if (place.latitude != null && place.longitude != null) {
    return {
      text: `${place.latitude},${place.longitude}`,
      placeId: place.googlePlaceId ?? undefined,
    };
  }
  const label =
    [place.name?.trim(), place.address?.trim()].filter(Boolean).join(", ") ||
    place.name?.trim() ||
    place.address?.trim() ||
    null;
  if (!label) return null;
  return {
    text: label,
    placeId: place.googlePlaceId ?? undefined,
  };
}

/**
 * Google Maps directions URL with origin + destination pre-selected.
 * https://developers.google.com/maps/documentation/urls/get-started#directions-action
 */
export function googleMapsDirectionsUrl(opts: {
  origin: MapsPlaceRef;
  destination: MapsPlaceRef;
  travelMode?: TravelMode | null;
}): string | null {
  const origin = placeWaypoint(opts.origin);
  const destination = placeWaypoint(opts.destination);
  if (!origin || !destination) return null;

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin.text);
  url.searchParams.set("destination", destination.text);
  url.searchParams.set(
    "travelmode",
    normalizeTravelMode(opts.travelMode ?? "driving"),
  );
  if (origin.placeId) {
    url.searchParams.set("origin_place_id", origin.placeId);
  }
  if (destination.placeId) {
    url.searchParams.set("destination_place_id", destination.placeId);
  }
  return url.toString();
}
