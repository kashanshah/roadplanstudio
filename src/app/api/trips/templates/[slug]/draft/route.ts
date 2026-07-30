import { NextResponse } from "next/server";
import {
  loadTemplateForGuestDraft,
  templateToGuestDraft,
} from "@/lib/trips/duplicate";

type Ctx = { params: Promise<{ slug: string }> };

/** Public: return a guest-ready draft for remixing a public/unlisted template. */
export async function GET(_request: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const source = await loadTemplateForGuestDraft(slug);
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
  } catch (err) {
    console.error("template draft failed", err);
    return NextResponse.json(
      { error: "Could not load this template" },
      { status: 500 },
    );
  }
}
