import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Discover trips",
  description:
    "Browse public road trip itineraries on RoadPlan Studio — maps, days, and lodging ready to remix.",
  alternates: { canonical: "/discover" },
};

export default function DiscoverPage() {
  return (
    <div className="min-h-full bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/planner/new"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Start planning
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">
          Discover
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Public itineraries will appear here — starting with the Western
          Canada Road Trip 2026 template.
        </p>
        <Link
          href="/trips/western-canada-2026"
          className="mt-8 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Western Canada Road Trip 2026
        </Link>
      </main>
    </div>
  );
}
