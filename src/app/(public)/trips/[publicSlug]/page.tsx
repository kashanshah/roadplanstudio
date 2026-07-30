import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

type Props = {
  params: Promise<{ publicSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicSlug } = await params;
  const title =
    publicSlug === "western-canada-2026"
      ? "Western Canada Road Trip 2026"
      : publicSlug.replace(/-/g, " ");

  return {
    title,
    description: `Explore the ${title} itinerary on ${SITE_NAME}.`,
    alternates: { canonical: `/trips/${publicSlug}` },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      url: `${SITE_URL}/trips/${publicSlug}`,
    },
  };
}

export default async function PublicTripPage({ params }: Props) {
  const { publicSlug } = await params;
  const isWesternCanada = publicSlug === "western-canada-2026";

  const tripJsonLd = {
    "@context": "https://schema.org",
    "@type": "Trip",
    name: isWesternCanada
      ? "Western Canada Road Trip 2026"
      : publicSlug.replace(/-/g, " "),
    description: isWesternCanada
      ? "A 13-day circular road trip through Western Canada."
      : "A public road trip itinerary on RoadPlan Studio.",
    url: `${SITE_URL}/trips/${publicSlug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Discover",
        item: `${SITE_URL}/discover`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: isWesternCanada
          ? "Western Canada Road Trip 2026"
          : publicSlug,
        item: `${SITE_URL}/trips/${publicSlug}`,
      },
    ],
  };

  return (
    <div className="min-h-full bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([tripJsonLd, breadcrumbJsonLd]),
        }}
      />
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="eyebrow text-primary">Public itinerary</p>
        <h1 className="mt-3 font-display text-3xl font-semibold capitalize tracking-tight text-foreground sm:text-5xl">
          {isWesternCanada
            ? "Western Canada Road Trip 2026"
            : publicSlug.replace(/-/g, " ")}
        </h1>
        {isWesternCanada ? (
          <p className="mt-4 max-w-2xl text-muted-foreground">
            13 days · Saskatoon to Calgary to Banff to Jasper to Vancouver to
            Clearwater to Edmonton and back. Seed itinerary for RoadPlan Studio.
          </p>
        ) : (
          <p className="mt-4 text-muted-foreground">
            Trip details will load from Neon once Phase 3 migrations land.
          </p>
        )}
        <Button asChild className="mt-8">
          <Link href="/planner/new">Remix this trip</Link>
        </Button>
      </main>
    </div>
  );
}
