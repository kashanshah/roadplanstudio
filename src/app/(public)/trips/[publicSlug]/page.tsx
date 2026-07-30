import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
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
    itinerary: isWesternCanada
      ? [
          "Saskatoon",
          "Calgary",
          "Banff",
          "Jasper",
          "Vancouver",
          "Clearwater",
          "Edmonton",
          "Saskatoon",
        ]
      : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
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
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <Link
            href="/planner/new"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Remix this trip
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
          Public itinerary
        </p>
        <h1 className="mt-3 font-display text-3xl capitalize text-foreground sm:text-5xl">
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
      </main>
    </div>
  );
}
