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

type TextSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
    types?: string[];
    googleMapsUri?: string;
  }>;
  error?: { message?: string; status?: string };
};

type PlaceDetailsResponse = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  googleMapsUri?: string;
  error?: { message?: string };
};

function getApiKey() {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");
  }
  return key;
}

function mapPlace(p: {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  googleMapsUri?: string;
}): PlaceResult | null {
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

/** Places API (New) Text Search — returns best match or null. */
export async function searchPlace(
  query: string,
  opts?: {
    latitude?: number;
    longitude?: number;
    radiusMeters?: number;
  },
): Promise<PlaceResult | null> {
  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 5,
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
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri",
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

  const first = data.places?.[0];
  return first ? mapPlace(first) : null;
}

export async function getPlaceDetails(
  placeId: string,
): Promise<PlaceResult | null> {
  const id = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const res = await fetch(`https://places.googleapis.com/v1/${id}`, {
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,location,types,googleMapsUri",
    },
  });

  const data = (await res.json()) as PlaceDetailsResponse;
  if (!res.ok) {
    throw new Error(
      data.error?.message || `Place Details failed (${res.status})`,
    );
  }

  return mapPlace(data);
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
  return new Promise((r) => setTimeout(r, ms));
}
