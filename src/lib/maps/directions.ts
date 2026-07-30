/**
 * Server-only Google Directions repository.
 * Uses GOOGLE_MAPS_SERVER_API_KEY.
 */

export type RoutePoint = {
  latitude: number;
  longitude: number;
};

export type RouteLeg = {
  durationMins: number;
  distanceMeters: number;
  distanceKm: number;
  estimated: boolean;
};

export type DrivingRoute = {
  legs: RouteLeg[];
  /** Decoded overview path for map drawing (road-following when available). */
  path: Array<{ lat: number; lng: number }>;
  source: "directions" | "estimated";
};

function getApiKey() {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_MAPS_SERVER_API_KEY is not set");
  }
  return key;
}

/** Haversine distance in meters. */
export function haversineMeters(a: RoutePoint, b: RoutePoint): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rough drive-time estimate (~80 km/h average, min 5 min). */
export function estimateDriveMins(distanceMeters: number): number {
  const hours = distanceMeters / 1000 / 80;
  return Math.max(5, Math.round(hours * 60));
}

/** Decode Google encoded polyline into lat/lng path. */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const coordinates: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

function estimateRoute(points: RoutePoint[]): DrivingRoute {
  const legs: RouteLeg[] = [];
  const path = points.map((p) => ({ lat: p.latitude, lng: p.longitude }));
  for (let i = 0; i < points.length - 1; i++) {
    const distanceMeters = Math.round(
      haversineMeters(points[i], points[i + 1]),
    );
    legs.push({
      durationMins: estimateDriveMins(distanceMeters),
      distanceMeters,
      distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
      estimated: true,
    });
  }
  return { legs, path, source: "estimated" };
}

type DirectionsJson = {
  status: string;
  routes?: Array<{
    overview_polyline?: { points?: string };
    legs?: Array<{
      duration?: { value?: number };
      distance?: { value?: number };
      steps?: Array<{ polyline?: { points?: string } }>;
    }>;
  }>;
  error_message?: string;
};

async function fetchDirections(
  origin: RoutePoint,
  destination: RoutePoint,
  waypoints: RoutePoint[] = [],
): Promise<DirectionsJson> {
  const key = getApiKey();
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set(
    "origin",
    `${origin.latitude},${origin.longitude}`,
  );
  url.searchParams.set(
    "destination",
    `${destination.latitude},${destination.longitude}`,
  );
  url.searchParams.set("mode", "driving");
  url.searchParams.set("units", "metric");
  url.searchParams.set("key", key);
  if (waypoints.length) {
    url.searchParams.set(
      "waypoints",
      waypoints.map((p) => `${p.latitude},${p.longitude}`).join("|"),
    );
  }
  const res = await fetch(url.toString());
  return (await res.json()) as DirectionsJson;
}

function parseRoute(data: DirectionsJson): DrivingRoute | null {
  const route = data.routes?.[0];
  if (data.status !== "OK" || !route?.legs?.length) return null;

  const legs: RouteLeg[] = route.legs.map((leg) => {
    const distanceMeters = leg.distance?.value ?? 0;
    const durationMins = Math.max(
      1,
      Math.round((leg.duration?.value ?? 0) / 60),
    );
    return {
      durationMins,
      distanceMeters,
      distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
      estimated: false,
    };
  });

  let path: Array<{ lat: number; lng: number }> = [];
  if (route.overview_polyline?.points) {
    path = decodePolyline(route.overview_polyline.points);
  } else {
    for (const leg of route.legs) {
      for (const step of leg.steps ?? []) {
        if (step.polyline?.points) {
          path = path.concat(decodePolyline(step.polyline.points));
        }
      }
    }
  }

  return { legs, path, source: "directions" };
}

/**
 * Pairwise Directions — more reliable when a multi-waypoint day fails
 * (lakes, viewpoints, MAX_WAYPOINTS_EXCEEDED, etc.).
 */
async function getPairwiseRoute(points: RoutePoint[]): Promise<DrivingRoute> {
  const legs: RouteLeg[] = [];
  const path: Array<{ lat: number; lng: number }> = [];
  let anyDirections = false;

  for (let i = 0; i < points.length - 1; i++) {
    const data = await fetchDirections(points[i], points[i + 1]);
    const parsed = parseRoute(data);
    if (parsed) {
      anyDirections = true;
      legs.push(...parsed.legs);
      if (path.length && parsed.path.length) {
        path.push(...parsed.path.slice(1));
      } else {
        path.push(...parsed.path);
      }
    } else {
      const distanceMeters = Math.round(
        haversineMeters(points[i], points[i + 1]),
      );
      legs.push({
        durationMins: estimateDriveMins(distanceMeters),
        distanceMeters,
        distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
        estimated: true,
      });
      const a = { lat: points[i].latitude, lng: points[i].longitude };
      const b = {
        lat: points[i + 1].latitude,
        lng: points[i + 1].longitude,
      };
      if (!path.length) path.push(a);
      path.push(b);
    }
  }

  return {
    legs,
    path,
    source: anyDirections ? "directions" : "estimated",
  };
}

/**
 * Driving route between consecutive points via Directions API.
 * Falls back to pairwise requests, then haversine estimates.
 */
export async function getDrivingRoute(
  points: RoutePoint[],
): Promise<DrivingRoute> {
  if (points.length < 2) {
    return { legs: [], path: [], source: "estimated" };
  }

  try {
    const middle = points.slice(1, -1).slice(0, 23);
    const data = await fetchDirections(
      points[0],
      points[points.length - 1],
      middle,
    );
    const parsed = parseRoute(data);
    if (parsed && parsed.path.length >= 2) {
      return parsed;
    }

    // Multi-stop day often fails ( Banff lakes / natural features ).
    if (points.length > 2) {
      return getPairwiseRoute(points);
    }

    return estimateRoute(points);
  } catch {
    try {
      return await getPairwiseRoute(points);
    } catch {
      return estimateRoute(points);
    }
  }
}

/** @deprecated Prefer getDrivingRoute — kept for callers that only need legs. */
export async function getDrivingLegs(
  points: RoutePoint[],
): Promise<RouteLeg[]> {
  const route = await getDrivingRoute(points);
  return route.legs;
}
