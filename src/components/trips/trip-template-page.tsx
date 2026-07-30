import Image from "next/image";
import Link from "next/link";
import type { TripTemplate } from "@/data/trips/templates";
import { SITE_URL } from "@/lib/constants";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { RemixTripButton } from "@/components/trips/remix-trip-button";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function TripTemplatePage({
  trip,
  locale = "en",
}: {
  trip: TripTemplate;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Trip",
        name: trip.title,
        description: trip.description,
        url: `${SITE_URL}${localizedPath(locale, `/trips/${trip.slug}`)}`,
        itinerary: trip.days.map((d) => ({
          "@type": "TouristTrip",
          name: d.title,
          description: d.summary,
        })),
        touristType: "Road trip",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}${localizedPath(locale, "/")}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Discover",
            item: `${SITE_URL}${localizedPath(locale, "/discover")}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: trip.title,
            item: `${SITE_URL}${localizedPath(locale, `/trips/${trip.slug}`)}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteNav />
      <main>
        <section className="relative isolate min-h-[42svh] overflow-hidden">
          <Image
            src={trip.coverImage}
            alt={trip.coverAlt}
            fill
            priority
            className="absolute inset-0 -z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.174_0.012_175.5/0.55)_0%,oklch(0.174_0.012_175.5/0.88)_100%)]" />
          <div className="relative mx-auto flex min-h-[42svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6">
            <p className="eyebrow text-accent">
              {trip.region} · {trip.continent}
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
              {trip.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-snow/80">{trip.tagline}</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {trip.description}
            </p>

            <ul className="mt-8 space-y-3">
              {trip.highlights.map((h) => (
                <li
                  key={h}
                  className="border-l-2 border-primary/40 pl-4 text-base text-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>

            <h2 className="mt-12 font-display text-3xl font-semibold tracking-tight">
              Day spine
            </h2>
            <ol className="mt-6 space-y-6">
              {trip.days.map((day, i) => (
                <li key={day.title} className="border-t border-border pt-5">
                  <p className="text-sm tracking-widest text-muted-foreground uppercase">
                    Day {i + 1}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{day.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">
                    {day.summary}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {day.stops.map((s) => (
                      <li key={`${day.title}-${s.name}`}>
                        {s.name}
                        <span className="text-muted-foreground/70">
                          {" "}
                          · {s.type}
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </article>

          <aside className="space-y-6 lg:pt-2">
            <dl className="grid grid-cols-2 gap-4 border-t border-border pt-6 lg:grid-cols-1">
              {[
                [dict.common.days, String(trip.durationDays)],
                [
                  dict.common.distance,
                  `~${trip.totalDistanceKm.toLocaleString()} km`,
                ],
                [dict.common.difficulty, trip.difficulty],
                [dict.common.bestSeason, trip.bestSeason],
                ["Currency", trip.currency],
                ["Driving", trip.drivingSide === "left" ? "Left" : "Right"],
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

            <div className="flex flex-col gap-3">
              <RemixTripButton
                slug={trip.slug}
                fullWidthOnMobile
                label={dict.common.startPlanning}
                className="w-full sm:w-full"
                additionalClasses={{
                  buttonClasses: "w-full sm:w-full"
                }}
              />
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href={localizedPath(locale, "/discover")}>
                  {dict.common.discoverTrips}
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Uses this itinerary as a template. Signed-in users get a new owned
              trip; guests plan locally in the browser until they save an
              account.
            </p>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
