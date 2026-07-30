import { NextResponse } from "next/server";
import { z } from "zod";
import { searchPlaces } from "@/lib/maps/places";

const querySchema = z.object({
  q: z.string().trim().min(2).max(200),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: url.searchParams.get("q"),
    lat: url.searchParams.get("lat") ?? undefined,
    lng: url.searchParams.get("lng") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const places = await searchPlaces(parsed.data.q, {
      latitude: parsed.data.lat,
      longitude: parsed.data.lng,
      pageSize: 8,
    });
    return NextResponse.json({ places });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Places search failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
