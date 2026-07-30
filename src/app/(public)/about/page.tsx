import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/about",
    "About RoadPlan Studio",
    "RoadPlan Studio is a map-first itinerary studio for multi-day international road trips — guest-friendly and tripmate-ready.",
  ),
};

export default function AboutPage() {
  const dict = getDictionary("en");
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main>
        <section className="relative isolate min-h-[48svh] overflow-hidden">
          <Image
            src="/images/blog-international.jpg"
            alt="Open road through varied terrain under a wide sky"
            fill
            priority
            className="absolute inset-0 -z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.174_0.012_175.5/0.55)_0%,oklch(0.174_0.012_175.5/0.9)_100%)]" />
          <div className="relative mx-auto flex min-h-[48svh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6">
            <p className="eyebrow text-accent">About</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
              {dict.about.title}
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <p className="text-xl leading-relaxed text-muted-foreground">
            {dict.about.body}
          </p>
          <div className="mt-10 space-y-6 text-lg leading-relaxed">
            <p>
              We started RoadPlan Studio because spreadsheet itineraries cannot
              feel a mountain pass. Distance, daylight and overnight geometry
              belong on a map — especially when your trip crosses languages,
              currencies and driving sides.
            </p>
            <p>
              Guests can plan immediately. Accounts unlock cloud sync, sharing
              and editor/viewer permissions for tripmates. Public templates span
              six continents so you remix a spine instead of starting from a
              blank day list.
            </p>
            <p>
              The product is based in the Pacific Northwest aesthetic, but the
              routes are global: Western Canada, Iceland, the Alps, Hokkaido,
              Patagonia, Morocco and more.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/planner/new">Start planning</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
