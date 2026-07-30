import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Discover trips",
  description:
    "Browse public road trip itineraries on RoadPlan Studio — maps, days, and lodging ready to remix.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverPage() {
  return (
    <div className="min-h-full bg-background">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="eyebrow text-primary">Public itineraries</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Discover
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Public itineraries will appear here — starting with the Western Canada
          Road Trip 2026 template.
        </p>
        <Button asChild className="mt-8">
          <Link href="/trips/western-canada-2026">
            Western Canada Road Trip 2026
          </Link>
        </Button>
      </main>
    </div>
  );
}
