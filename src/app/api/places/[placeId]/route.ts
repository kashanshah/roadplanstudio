import { NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/maps/places";

type Ctx = { params: Promise<{ placeId: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { placeId } = await ctx.params;
  if (!placeId || placeId.length < 4) {
    return NextResponse.json({ error: "Invalid place id" }, { status: 400 });
  }

  try {
    const place = await getPlaceDetails(decodeURIComponent(placeId));
    if (!place) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ place });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Place details failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
