import type { Metadata } from "next";
import Link from "next/link";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { TripTemplateCard } from "@/components/trips/trip-template-card";
import { SiteFooter, SiteNav } from "@/components/layout/site-nav";
import { tripTemplates } from "@/data/trips/templates";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localeMetadataBase } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);
  return localeMetadataBase(locale, "/discover", dict.discover.title, dict.discover.body);
}

export default async function LocalizedDiscoverPage({ params }: Props) {
  const locale = resolveMarketingLocale((await params).locale);
  const dict = getDictionary(locale);

  return (
    <div className="min-h-screen bg-background text-[17px]">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="eyebrow text-primary">{dict.nav.discover}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dict.discover.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {dict.discover.body}
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {tripTemplates.map((trip) => (
            <TripTemplateCard key={trip.slug} trip={trip} locale={locale} />
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          <Link
            href={localizedPath(locale, "/destinations")}
            className="text-primary hover:underline"
          >
            {dict.nav.destinations} →
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
