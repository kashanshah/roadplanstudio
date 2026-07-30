import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TripTemplatePage } from "@/components/trips/trip-template-page";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { Button } from "@/components/ui/button";
import { RemixTripButton } from "@/components/trips/remix-trip-button";
import { getTripTemplate, tripTemplates } from "@/data/trips/templates";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { tripShareMetadata } from "@/lib/i18n/seo";
import { formatDayHeading } from "@/lib/trips/format-day-label";
import { getPublicTripBySlug } from "@/lib/trips/public";

type Props = {
  params: Promise<{ publicSlug: string }>;
};

export function generateStaticParams() {
  return tripTemplates.map((t) => ({ publicSlug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { publicSlug } = await params;
  const template = getTripTemplate(publicSlug);

  let data = null;
  try {
    data = await getPublicTripBySlug(publicSlug);
  } catch {
    data = null;
  }

  if (data) {
    const { trip } = data;
    const indexable = trip.visibility === "public";
    const imageUrl =
      trip.coverPhotoUrl ||
      (template ? template.coverImage : null) ||
      `/trips/${trip.slug}/opengraph-image`;
    return {
      ...tripShareMetadata({
        locale: "en",
        path: `/trips/${trip.slug}`,
        title: trip.title,
        description: trip.description ?? template?.description ?? "",
        imageUrl,
        imageAlt: template?.coverAlt ?? trip.title,
        keywords: template?.seoKeywords,
      }),
      robots: indexable
        ? { index: true, follow: true }
        : { index: false, follow: false },
    };
  }

  if (template) {
    return tripShareMetadata({
      locale: "en",
      path: `/trips/${template.slug}`,
      title: template.title,
      description: template.description,
      imageUrl: template.coverImage,
      imageAlt: template.coverAlt,
      keywords: template.seoKeywords,
    });
  }

  return {
    title: "Trip not found",
    robots: { index: false, follow: false },
  };
}

export default async function PublicTripPage({ params }: Props) {
  const { publicSlug } = await params;
  let data = null;
  try {
    data = await getPublicTripBySlug(publicSlug);
  } catch {
    data = null;
  }

  if (!data) {
    const template = getTripTemplate(publicSlug);
    if (template) return <TripTemplatePage trip={template} locale="en" />;
    notFound();
  }

  const { trip, owner, days, accommodations } = data;
  const template = getTripTemplate(publicSlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Trip",
        name: trip.title,
        description: trip.description,
        url: `${SITE_URL}/trips/${trip.slug}`,
        itinerary: days.map((d) => ({
          "@type": "TouristTrip",
          name: d.title,
          description: d.routeSummary,
        })),
      },
      {
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
            name: trip.title,
            item: `${SITE_URL}/trips/${trip.slug}`,
          },
        ],
      },
      ...accommodations
        .filter((a) => a.latitude != null && a.longitude != null)
        .map((a) => ({
          "@type": "LodgingBusiness",
          name: a.name,
          address: a.address,
          geo: {
            "@type": "GeoCoordinates",
            latitude: a.latitude,
            longitude: a.longitude,
          },
        })),
      ...days.flatMap((d) =>
        d.items
          .filter((i) => i.type === "attraction" && i.latitude != null)
          .map((i) => ({
            "@type": "TouristAttraction",
            name: i.name,
            address: i.address,
            geo: {
              "@type": "GeoCoordinates",
              latitude: i.latitude,
              longitude: i.longitude,
            },
          })),
      ),
    ],
  };

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {trip.coverPhotoUrl || template?.coverImage ? (
          <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-3xl">
            <Image
              src={trip.coverPhotoUrl || template!.coverImage}
              alt={template?.coverAlt || trip.title}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
              priority
            />
          </div>
        ) : null}

        <p className="eyebrow text-primary">{SITE_NAME}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {trip.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {trip.description}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6 sm:grid-cols-4">
          {[
            ["Duration", `${trip.durationDays} days`],
            [
              "Distance",
              trip.totalDistanceKm
                ? `~${Math.round(trip.totalDistanceKm).toLocaleString()} km`
                : "—",
            ],
            ["Difficulty", trip.difficulty],
            ["Author", owner?.fullName || "RoadPlan Studio"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm tracking-widest text-muted-foreground uppercase">
                {k}
              </dt>
              <dd className="mt-1 font-display text-xl font-semibold capitalize">
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-start gap-3">
          {trip.slug ? (
            <RemixTripButton slug={trip.slug} fullWidthOnMobile />
          ) : null}
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link href="/discover">More trips</Link>
          </Button>
        </div>

        <section className="mt-14 space-y-10">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Daily itinerary
          </h2>
          {days.map((day) => (
            <article key={day.id} className="border-t border-border pt-8">
              <p className="break-words text-sm tracking-widest text-muted-foreground uppercase">
                {formatDayHeading(day.dayIndex, day.date)}
                {day.routeSummary ? ` · ${day.routeSummary}` : ""}
              </p>
              <h3 className="mt-2 break-words font-display text-2xl font-semibold sm:text-3xl">
                {day.title}
              </h3>
              {day.notes ? (
                <p className="mt-2 break-words text-base text-muted-foreground">{day.notes}</p>
              ) : null}
              <ul className="mt-5 space-y-3">
                {day.items.map((item) => (
                  <li key={item.id} className="flex gap-3 text-base sm:text-lg">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="break-words font-medium">{item.name}</p>
                      {item.address ? (
                        <p className="break-words text-sm text-muted-foreground sm:text-base">
                          {item.address}
                        </p>
                      ) : null}
                      {item.notes ? (
                        <p className="text-sm text-muted-foreground italic">
                          {item.notes}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {accommodations.length ? (
          <section className="mt-14 border-t border-border pt-10">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              Overnight stays
            </h2>
            <ul className="mt-6 space-y-5">
              {accommodations.map((a) => (
                <li key={a.id}>
                  <p className="text-lg font-medium">{a.name}</p>
                  {a.address ? (
                    <p className="text-base text-muted-foreground">{a.address}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
