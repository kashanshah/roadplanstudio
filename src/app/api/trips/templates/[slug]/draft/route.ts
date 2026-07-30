import { NextResponse } from "next/server";
import {
  loadTemplateTrip,
  templateToGuestDraft,
} from "@/lib/trips/duplicate";

type Ctx = { params: Promise<{ slug: string }> };

/** Public: return a guest-ready draft for remixing a public/unlisted template. */
export async function GET(_request: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const source = await loadTemplateTrip(slug);
  if (!source) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json({
    draft: templateToGuestDraft(source),
    source: {
      id: source.trip.id,
      slug: source.trip.slug,
      title: source.trip.title,
    },
  });
}
