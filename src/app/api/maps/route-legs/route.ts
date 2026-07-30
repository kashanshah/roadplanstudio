import { NextResponse } from "next/server";
import { z } from "zod";
import { getDrivingRoute } from "@/lib/maps/directions";

const schema = z.object({
  points: z
    .array(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }),
    )
    .min(2)
    .max(25),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid points" }, { status: 400 });
  }

  try {
    const route = await getDrivingRoute(parsed.data.points);
    return NextResponse.json(route);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Directions lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
