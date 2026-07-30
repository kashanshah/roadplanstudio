import type { Metadata } from "next";
import Link from "next/link";
import { Map, Route as RouteIcon, Share2, Globe2, Layers3, MoonStar } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { localeMetadataBase } from "@/lib/i18n/seo";
import { getDictionary } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  ...localeMetadataBase(
    "en",
    "/features",
    "RoadPlan Studio features",
    "Map-first itineraries, live drive pacing, international templates, guest mode and tripmate permissions.",
  ),
};

const features = [
  {
    icon: Map,
    title: "Map-first canvas",
    body: "Stops, lodging and day blocks live on the same map — reorder and watch the route update.",
  },
  {
    icon: RouteIcon,
    title: "Honest drive math",
    body: "Directions-aware pacing so mountain and coastal days do not pretend to be flat highway miles.",
  },
  {
    icon: Globe2,
    title: "International templates",
    body: "Seeded itineraries across six continents with local season, currency and driving-side context.",
  },
  {
    icon: Share2,
    title: "Tripmate permissions",
    body: "Viewer and editor roles so the group can contribute without chaos.",
  },
  {
    icon: Layers3,
    title: "Guest → cloud",
    body: "Plan anonymously, then claim the trip into a Better Auth account when you are ready.",
  },
  {
    icon: MoonStar,
    title: "Stop status sync",
    body: "Mark stops visited, skipped or favorite — the map stays aligned while you travel.",
  },
];

export default function FeaturesPage() {
  const dict = getDictionary("en");
  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">Features</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.featuresPage.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.featuresPage.body}
        </p>

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="border-t border-border pt-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-xl font-semibold">{f.title}</h2>
              <p className="mt-2 text-base text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/planner/new">Start planning</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/request-feature">Request a feature</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
