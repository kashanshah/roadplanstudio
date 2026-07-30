import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveMarketingLocale } from "@/lib/i18n/resolve";
import { TripTemplatePage } from "@/components/trips/trip-template-page";
import { getTripTemplate, tripTemplates } from "@/data/trips/templates";
import { tripShareMetadata } from "@/lib/i18n/seo";

type Props = { params: Promise<{ locale: string; publicSlug: string }> };

export function generateStaticParams() {
  const locales = ["fr", "es", "de", "ja"];
  return locales.flatMap((locale) =>
    tripTemplates.map((t) => ({ locale, publicSlug: t.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, publicSlug } = await params;
  const locale = resolveMarketingLocale(raw);
  const trip = getTripTemplate(publicSlug);
  if (!trip) return { title: "Not found", robots: { index: false } };
  return tripShareMetadata({
    locale,
    path: `/trips/${trip.slug}`,
    title: trip.title,
    description: trip.description,
    imageUrl: trip.coverImage,
    imageAlt: trip.coverAlt,
    keywords: trip.seoKeywords,
  });
}

export default async function LocalizedTripPage({ params }: Props) {
  const { locale: raw, publicSlug } = await params;
  const locale = resolveMarketingLocale(raw);
  const trip = getTripTemplate(publicSlug);
  if (!trip) notFound();
  return <TripTemplatePage trip={trip} locale={locale} />;
}
