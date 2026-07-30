/**
 * Server-only Google Places / Geocoding repository.
 * Uses GOOGLE_MAPS_SERVER_API_KEY (Places API New).
 */

export type PlaceResult = {
  placeId: string;
  name: string;
  formattedAddress: string | null;
  latitude: number;
  longitude: number;
  types: string[];
  googleMapsUri: string | null;
};

export type PlaceDetails = PlaceResult & {
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

type PlacePayload = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  editorialSummary?: { text?: string };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: Array<{ name?: string }>;
  priceLevel?: string;
};

type TextSearchResponse = {
  places?: PlacePayload[];
  error?: { message?: string; status?: string };
};

type PlaceDetailsResponse = PlacePayload & {
  error?: { message?: string };
};

const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.photos",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "types",
  "googleMapsUri",
  "rating",
  "userRatingCount",
  "editorialSummary",
  "websiteUri",
  "nationalPhoneNumber",
  "regularOpeningHours",
  "photos",
  "priceLevel",
].join(",");

function getApiKey() {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");
  }
  return key;
}

/** Heuristic visit duration when Places has no dwell-time field. */
export function estimateDurationFromTypes(types: string[]): number {
  const set = new Set(types);
  if (set.has("lodging") || set.has("hotel")) return 0;
  if (set.has("museum") || set.has("art_gallery")) return 120;
  if (set.has("amusement_park") || set.has("zoo") || set.has("aquarium"))
    return 180;
  if (set.has("national_park") || set.has("park")) return 150;
  if (set.has("hiking_area") || set.has("campground")) return 180;
  if (set.has("shopping_mall") || set.has("department_store")) return 90;
  if (set.has("restaurant") || set.has("cafe") || set.has("bakery")) return 75;
  if (set.has("spa") || set.has("hot_spring")) return 120;
  if (set.has("tourist_attraction") || set.has("point_of_interest")) return 90;
  if (set.has("locality") || set.has("route")) return 30;
  return 60;
}

function mapPlace(p: PlacePayload): PlaceResult | null {
  if (
    !p.id ||
    p.location?.latitude == null ||
    p.location?.longitude == null
  ) {
    return null;
  }
  return {
    placeId: p.id,
    name: p.displayName?.text || "Unknown place",
    formattedAddress: p.formattedAddress ?? null,
    latitude: p.location.latitude,
    longitude: p.location.longitude,
    types: p.types ?? [],
    googleMapsUri: p.googleMapsUri ?? null,
  };
}

function mapPlaceDetails(p: PlacePayload): PlaceDetails | null {
  const base = mapPlace(p);
  if (!base) return null;
  const types = p.types ?? [];
  return {
    ...base,
    rating: p.rating ?? null,
    userRatingCount: p.userRatingCount ?? null,
    editorialSummary: p.editorialSummary?.text ?? null,
    websiteUri: p.websiteUri ?? null,
    nationalPhoneNumber: p.nationalPhoneNumber ?? null,
    regularOpeningHours: p.regularOpeningHours?.weekdayDescriptions ?? null,
    photoNames: (p.photos ?? [])
      .map((photo) => photo.name)
      .filter((name): name is string => !!name)
      .slice(0, 4),
    priceLevel: p.priceLevel ?? null,
    estimatedDurationMins: estimateDurationFromTypes(types),
  };
}

/** Places API (New) Text Search — returns ranked matches. */
export async function searchPlaces(
  query: string,
  opts?: {
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
    pageSize?: number;
  },
): Promise<PlaceDetails[]> {
  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: Math.min(opts?.pageSize ?? 8, 10),
    languageCode: "en",
    regionCode: "CA",
  };

  if (opts?.latitude != null && opts?.longitude != null) {
    body.locationBias = {
      circle: {
        center: {
          latitude: opts.latitude,
          longitude: opts.longitude,
        },
        radius: Math.min(opts.radiusMeters ?? 50_000, 50_000),
      },
    };
  }

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": getApiKey(),
        "X-Goog-FieldMask": SEARCH_FIELD_MASK,
      },
      body: JSON.stringify(body),
    },
  );

  const data = (await res.json()) as TextSearchResponse;
  if (!res.ok) {
    throw new Error(
      data.error?.message || `Places Text Search failed (${res.status})`,
    );
  }

  return (data.places ?? [])
    .map(mapPlaceDetails)
    .filter((p): p is PlaceDetails => p != null);
}

/** Places API (New) Text Search — returns best match or null. */
export async function searchPlace(
  query: string,
  opts?: {
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
  },
): Promise<PlaceResult | null> {
  const results = await searchPlaces(query, { ...opts, pageSize: 1 });
  return results[0] ?? null;
}

export async function getPlaceDetails(
  placeId: string,
): Promise<PlaceDetails | null> {
  const id = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const res = await fetch(`https://places.googleapis.com/v1/${id}`, {
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  });

  const data = (await res.json()) as PlaceDetailsResponse;
  if (!res.ok) {
    throw new Error(
      data.error?.message || `Place Details failed (${res.status})`,
    );
  }

  return mapPlaceDetails(data);
}

/** Proxy a Places photo media URL (server-side key). */
export function buildPlacePhotoUrl(
  photoName: string,
  maxWidthPx = 800,
): string {
  const name = photoName.startsWith("places/")
    ? photoName
    : photoName;
  return `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidthPx}&key=${getApiKey()}`;
}

export async function geocodeAddress(
  address: string,
): Promise<PlaceResult | null> {
  const key = getApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", key);

  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      place_id: string;
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      types: string[];
    }>;
    error_message?: string;
  };

  if (data.status !== "OK" || !data.results?.[0]) {
    return null;
  }

  const r = data.results[0];
  return {
    placeId: r.place_id,
    name: r.formatted_address.split(",")[0] || r.formatted_address,
    formattedAddress: r.formatted_address,
    latitude: r.geometry.location.lat,
    longitude: r.geometry.location.lng,
    types: r.types,
    googleMapsUri: `https://www.google.com/maps/search/?api=1&query_place_id=${r.place_id}`,
  };
}

/** Resolve a query via Text Search, falling back to Geocoding. */
export async function resolvePlace(
  query: string,
  bias?: { latitude: number; longitude: number },
): Promise<PlaceResult | null> {
  const found = await searchPlace(query, bias);
  if (found) return found;
  return geocodeAddress(query);
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
