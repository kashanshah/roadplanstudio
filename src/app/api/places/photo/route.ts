import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  name: z.string().min(8).max(500),
  maxWidthPx: z.coerce.number().int().min(64).max(1600).default(800),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    name: url.searchParams.get("name"),
    maxWidthPx: url.searchParams.get("maxWidthPx") ?? 800,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid photo name" }, { status: 400 });
  }

  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Maps key missing" }, { status: 500 });
  }

  const name = parsed.data.name.startsWith("places/")
    ? parsed.data.name
    : parsed.data.name;

  const mediaUrl = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${parsed.data.maxWidthPx}&key=${key}`;
  const res = await fetch(mediaUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "Photo fetch failed" }, { status: 502 });
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
