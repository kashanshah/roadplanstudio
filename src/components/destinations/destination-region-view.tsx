import Image from "next/image";
import { TripTemplateCard } from "@/components/trips/trip-template-card";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import type { DestinationRegion } from "@/data/destinations/regions";
import { tripsForRegion } from "@/data/destinations/regions";
import type { TripTemplate } from "@/data/trips/templates";
import { SITE_URL } from "@/lib/constants";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export function DestinationRegionView({
  region,
  locale = "en",
}: {
  region: DestinationRegion;
  locale?: Locale;
}) {
  const dict = getDictionary(locale);
  const trips: TripTemplate[] = tripsForRegion(region.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: `RoadPlan Studio · ${region.name}`,
    url: `${SITE_URL}${localizedPath(locale, `/destinations/${region.slug}`)}`,
    description: region.description,
    areaServed: region.countries.map((c) => ({ "@type": "Country", name: c })),
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
            src={region.coverImage}
            alt={region.coverAlt}
            fill
            priority
            className="absolute inset-0 -z-20 object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.174_0.012_175.5/0.5)_0%,oklch(0.174_0.012_175.5/0.88)_100%)]" />
          <div className="relative mx-auto flex min-h-[42svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6">
            <p className="eyebrow text-accent">{region.continent}</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
              {region.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-snow/80">
              {region.headline}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="max-w-3xl text-lg text-muted-foreground" lang="en">
            {region.description}
          </p>
          <dl className="mt-8 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            <div>
              <dt className="text-sm tracking-widest text-muted-foreground uppercase">
                {dict.common.bestSeason}
              </dt>
              <dd className="mt-2 text-base" lang="en">
                {region.bestSeason}
              </dd>
            </div>
            <div>
              <dt className="text-sm tracking-widest text-muted-foreground uppercase">
                Countries
              </dt>
              <dd className="mt-2 text-base">{region.countries.join(", ")}</dd>
            </div>
            <div>
              <dt className="text-sm tracking-widest text-muted-foreground uppercase">
                Driving notes
              </dt>
              <dd className="mt-2 text-base" lang="en">
                {region.drivingNotes}
              </dd>
            </div>
          </dl>

          <h2 className="mt-14 font-display text-3xl font-semibold tracking-tight">
            {dict.nav.discover}
          </h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripTemplateCard key={trip.slug} trip={trip} locale={locale} />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
