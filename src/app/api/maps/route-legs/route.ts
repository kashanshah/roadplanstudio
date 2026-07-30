import { NextResponse } from "next/server";
import { z } from "zod";
import { getDrivingRoute } from "@/lib/maps/directions";

const travelModeSchema = z.enum([
  "driving",
  "walking",
  "bicycling",
  "transit",
]);

const schema = z
  .object({
    points: z
      .array(
        z.object({
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
        }),
      )
      .min(2)
      .max(25),
    /** Per-leg modes (length should be points.length - 1). Defaults to driving. */
    modes: z.array(travelModeSchema).max(24).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.modes && val.modes.length !== val.points.length - 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "modes length must equal points.length - 1",
        path: ["modes"],
      });
    }
  });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid points" }, { status: 400 });
  }

  try {
    const route = await getDrivingRoute(
      parsed.data.points,
      parsed.data.modes,
    );
    return NextResponse.json(route);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Directions lookup failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
